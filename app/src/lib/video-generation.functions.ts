import {
  createServerFn,
  createServerOnlyFn,
} from "@tanstack/react-start";
import { supabaseAdminFetch, supabaseUserFetch } from "./supabase-rest.server";

const YKI_ENGINE_MODEL = "wan2.2-ti2v-5b";

const requireYkiEngine = createServerOnlyFn(() => {
  const url = process.env.YKI_ENGINE_URL;
  const apiKey = process.env.YKI_ENGINE_API_KEY;
  if (!url || !apiKey) throw new Error("YKI Engine is not configured");
  return { url: url.replace(/\\/$/, ""), apiKey };
});

function getDurationSeconds(value: string) {
  if (value === "8s") {
    return 8;
  }

  throw new Error("Only 8 second generation is currently enabled");
}

function getResolution(format: string) {
  if (
    format === "9:16" ||
    format === "16:9" ||
    format === "1:1"
  ) {
    return "1080p";
  }

  return "1080p";
}

export const createVideoGeneration = createServerFn({
  method: "POST",
}).validator(
  (data: {
    accessToken: string;
    prompt: string;
    format: string;
    duration: string;
    style?: string;
    generateAudio?: boolean;
  }) => data,
).handler(async ({ data }) => {
  const prompt = data.prompt.trim();

  if (!prompt) {
    throw new Error("Prompt is required");
  }

  if (prompt.length > 4000) {
    throw new Error("Prompt is too long");
  }

  const durationSeconds = getDurationSeconds(data.duration);
  const resolution = getResolution(data.format);
  const generateAudio = data.generateAudio ?? true;

  const credits = durationSeconds * CREDITS_PER_SECOND;

  /*
   * 1. Kullanıcının workspace'ini bul
   */
  const workspaceResponse = await supabaseUserFetch(
    "/rest/v1/workspaces?select=id&limit=1",
    data.accessToken,
  );

  if (!workspaceResponse.ok) {
    const errorText = await workspaceResponse.text();

    throw new Error(
      `Unable to load workspace: ${errorText}`,
    );
  }

  const workspaces = (await workspaceResponse.json()) as Array<{
    id: string;
  }>;

  const workspace = workspaces[0];

  if (!workspace) {
    throw new Error(
      "No workspace found for this account",
    );
  }

  /*
   * 2. Yeni proje oluştur
   */
  const projectResponse = await supabaseUserFetch(
    "/rest/v1/rpc/create_project",
    data.accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        p_workspace_id: workspace.id,
        p_title: prompt.slice(0, 80),
        p_aspect_ratio: data.format,
        p_duration_seconds: durationSeconds,
      }),
    },
  );

  if (!projectResponse.ok) {
    const errorText = await projectResponse.text();

    throw new Error(
      `Unable to create project: ${errorText}`,
    );
  }

  const projectId = (await projectResponse.json()) as string;

  /*
   * 3. Kredi rezervasyonu
   */
  const idempotencyKey = crypto.randomUUID();

  const reserveResponse = await supabaseUserFetch(
    "/rest/v1/rpc/reserve_generation",
    data.accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        p_workspace_id: workspace.id,
        p_project_id: projectId,
        p_prompt: prompt,
        p_credits: credits,
        p_model: YKI_ENGINE_MODEL,
        p_aspect_ratio: data.format,
        p_duration_seconds: durationSeconds,
        p_idempotency_key: idempotencyKey,
      }),
    },
  );

  if (!reserveResponse.ok) {
    const errorText = await reserveResponse.text();

    throw new Error(
      `Credit reservation failed: ${errorText}`,
    );
  }

  const reservation = (await reserveResponse.json()) as Array<{
    generation_id: string;
    status: string;
    duplicate: boolean;
  }>;

  const generation = reservation[0];

  if (!generation?.generation_id) {
    throw new Error(
      "Generation reservation returned no generation ID",
    );
  }

  /*
   * Aynı istek daha önce oluşturulduysa
   * yeni Replicate işi oluşturma.
   */
  if (generation.duplicate) {
    return {
      generationId: generation.generation_id,
      status: generation.status,
      duplicate: true,
    };
  }

  /*
   * 4. Generation teknik bilgilerini kaydet
   */
  const updateGenerationResponse =
    await supabaseUserFetch(
      "/rest/v1/rpc/system_set_generation_options",
      data.accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          p_generation_id: generation.generation_id,
          p_resolution: resolution,
          p_generate_audio: generateAudio,
          p_model_version: MODEL,
        }),
      },
    );

  if (!updateGenerationResponse.ok) {
    await supabaseUserFetch(
      "/rest/v1/rpc/refund_generation",
      data.accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          p_generation_id: generation.generation_id,
        }),
      },
    );

    const errorText =
      await updateGenerationResponse.text();

    throw new Error(
      `Generation setup failed: ${errorText}`,
    );
  }

  /*
   * 5. YKI Engine üzerinde gerçek video üretimini başlat.
   */
  const engine = requireYkiEngine();
  let engineResponse: Response;

  try {
    engineResponse = await fetch(`${engine.url}/v1/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-YKI-Engine-Key": engine.apiKey,
      },
      body: JSON.stringify({
        generation_id: generation.generation_id,
        prompt,
        aspect_ratio: data.format,
        duration_seconds: durationSeconds,
        generate_audio: generateAudio,
      }),
    });
  } catch (error) {
    await supabaseUserFetch("/rest/v1/rpc/refund_generation", data.accessToken, {
      method: "POST",
      body: JSON.stringify({ p_generation_id: generation.generation_id }),
    });
    throw new Error(
      `YKI Engine unreachable: ${error instanceof Error ? error.message : "connection failed"}`,
    );
  }

  if (!engineResponse.ok) {
    const errorText = await engineResponse.text();
    await supabaseUserFetch("/rest/v1/rpc/refund_generation", data.accessToken, {
      method: "POST",
      body: JSON.stringify({ p_generation_id: generation.generation_id }),
    });
    throw new Error(`YKI Engine rejected generation: ${errorText}`);
  }

  const engineJob = (await engineResponse.json()) as {
    job_id: string;
    status: string;
  };

  /*
   * 6. YKI Engine job ID'sini Supabase'e kaydet.
   */
  const submittedResponse = await supabaseUserFetch(
    "/rest/v1/rpc/system_mark_generation_submitted",
    data.accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        p_generation_id: generation.generation_id,
        p_provider_job_id: engineJob.job_id,
        p_model_version: YKI_ENGINE_MODEL,
      }),
    },
  );

  if (!submittedResponse.ok) {
    throw new Error(
      "YKI Engine job was created but generation could not be marked as submitted",
    );
  }

  /*
   * 7. Studio'ya sonucu döndür
   */
  return {
    generationId:
      generation.generation_id,

    providerJobId:
      engineJob.job_id,

    status:
      prediction.status,

    credits,

    duplicate: false,
  };
});


export const getVideoGenerationStatus = createServerFn({
  method: "POST",
}).validator(
  (data: { accessToken: string; generationId: string }) => data,
).handler(async ({ data }) => {
  const response = await supabaseUserFetch(
    `/rest/v1/generations?select=id,status,output_url,error_code,credits_reserved,credits_charged,credits_refunded,created_at,completed_at&id=eq.${encodeURIComponent(data.generationId)}&limit=1`,
    data.accessToken,
  );

  if (!response.ok) {
    throw new Error("Unable to read generation status");
  }

  const rows = (await response.json()) as Array<{
    id: string;
    status: string;
    output_url: string | null;
    error_code: string | null;
    credits_reserved: number;
    credits_charged: number;
    credits_refunded: number;
    created_at: string;
    completed_at: string | null;
  }>;

  const generation = rows[0];

  if (!generation) {
    throw new Error("Generation not found");
  }

  let videoUrl: string | null = null;

  if (generation.status === "completed" && generation.output_url) {
    const signResponse = await supabaseAdminFetch(
      `/storage/v1/object/sign/yki-media/${generation.output_url.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/")}`,
      {
        method: "POST",
        body: JSON.stringify({ expiresIn: 3600 }),
      },
    );

    if (signResponse.ok) {
      const signed = (await signResponse.json()) as { signedURL?: string };
      if (signed.signedURL) {
        videoUrl = signed.signedURL.startsWith("http")
          ? signed.signedURL
          : `${"https://dtdygokcjjoprqfjmmcz.supabase.co"}${signed.signedURL}`;
      }
    }
  }

  return {
    ...generation,
    videoUrl,
  };
});
