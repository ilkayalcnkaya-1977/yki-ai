import {
  createServerFn,
  createServerOnlyFn,
} from "@tanstack/react-start";
import { supabaseAdminFetch, supabaseUserFetch } from "./supabase-rest.server";

const YKI_ENGINE_MODEL = "wan2.2-ti2v-5b";
const CREDITS_PER_SECOND = 4;

const getYkiEngine = createServerOnlyFn(() => ({
  url: process.env.YKI_ENGINE_URL?.replace(/\/$/, "") ?? "",
  apiKey: process.env.YKI_ENGINE_API_KEY ?? "",
}));

function getDurationSeconds(value: string) {
  if (value === "5s") return 5;
  if (value === "8s") return 8;
  throw new Error("Only 5 or 8 second generation is currently enabled");
}

function getAspectRatio(format: string) {
  if (format === "9:16" || format === "16:9" || format === "1:1") return format;
  return "9:16";
}

async function refundGeneration(generationId: string, errorCode: string) {
  const response = await supabaseAdminFetch(
    "/rest/v1/rpc/system_fail_generation",
    {
      method: "POST",
      body: JSON.stringify({
        p_generation_id: generationId,
        p_error_code: errorCode.slice(0, 200),
      }),
    },
  );

  if (!response.ok) {
    console.error("Failed to refund generation", generationId, await response.text());
  }
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

  if (!prompt) throw new Error("Prompt is required");
  if (prompt.length > 4000) throw new Error("Prompt is too long");

  const durationSeconds = getDurationSeconds(data.duration);
  const aspectRatio = getAspectRatio(data.format);
  const generateAudio = data.generateAudio !== false;
  const ykiEngine = getYkiEngine();

  if (!ykiEngine.url || !ykiEngine.apiKey) {
    throw new Error(
      "YKI Engine is not configured. External video providers are disabled.",
    );
  }

  const model = YKI_ENGINE_MODEL;
  const credits = durationSeconds * CREDITS_PER_SECOND;

  const workspaceResponse = await supabaseUserFetch(
    "/rest/v1/workspaces?select=id&limit=1",
    data.accessToken,
  );

  if (!workspaceResponse.ok) {
    throw new Error(
      \`Unable to load workspace: \${await workspaceResponse.text()}\`,
    );
  }

  const workspaces = (await workspaceResponse.json()) as Array<{ id: string }>;
  const workspace = workspaces[0];

  if (!workspace) throw new Error("No workspace found for this account");

  const projectResponse = await supabaseUserFetch(
    "/rest/v1/rpc/create_project",
    data.accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        p_workspace_id: workspace.id,
        p_title: prompt.slice(0, 80),
        p_aspect_ratio: aspectRatio,
        p_duration_seconds: durationSeconds,
      }),
    },
  );

  if (!projectResponse.ok) {
    throw new Error(
      \`Unable to create project: \${await projectResponse.text()}\`,
    );
  }

  const projectId = (await projectResponse.json()) as string;
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
        p_model: model,
        p_aspect_ratio: aspectRatio,
        p_duration_seconds: durationSeconds,
        p_idempotency_key: idempotencyKey,
      }),
    },
  );

  if (!reserveResponse.ok) {
    throw new Error(
      \`Credit reservation failed: \${await reserveResponse.text()}\`,
    );
  }

  const reservation = (await reserveResponse.json()) as Array<{
    generation_id: string;
    status: string;
    duplicate: boolean;
  }>;

  const generation = reservation[0];

  if (!generation?.generation_id) {
    throw new Error("Generation reservation returned no generation ID");
  }

  if (generation.duplicate) {
    return {
      generationId: generation.generation_id,
      status: generation.status,
      duplicate: true,
      credits,
    };
  }

  const updateGenerationResponse = await supabaseUserFetch(
    "/rest/v1/rpc/system_set_generation_options",
    data.accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        p_generation_id: generation.generation_id,
        p_resolution: "720p",
        p_generate_audio: generateAudio,
        p_model_version: model,
      }),
    },
  );

  if (!updateGenerationResponse.ok) {
    await refundGeneration(
      generation.generation_id,
      "GENERATION_SETUP_FAILED",
    );
    throw new Error(
      \`Generation setup failed: \${await updateGenerationResponse.text()}\`,
    );
  }

  try {
    const engineResponse = await fetch(\`\${ykiEngine.url}/v1/generations\`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-YKI-Engine-Key": ykiEngine.apiKey,
      },
      body: JSON.stringify({
        generation_id: generation.generation_id,
        prompt,
        style: data.style ?? "cinematic",
        aspect_ratio: aspectRatio,
        duration_seconds: durationSeconds,
        generate_audio: false,
      }),
    });

    if (!engineResponse.ok) {
      const errorText = await engineResponse.text();
      await refundGeneration(generation.generation_id, "YKI_ENGINE_REJECTED");
      throw new Error(\`YKI Engine rejected generation: \${errorText}\`);
    }

    const engineJob = (await engineResponse.json()) as {
      job_id?: string;
      status?: string;
    };

    if (!engineJob.job_id) {
      await refundGeneration(generation.generation_id, "YKI_ENGINE_NO_JOB_ID");
      throw new Error("YKI Engine returned no job ID");
    }

    return {
      generationId: generation.generation_id,
      providerJobId: engineJob.job_id,
      status: engineJob.status ?? "starting",
      credits,
      duplicate: false,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("YKI Engine")) throw error;
    await refundGeneration(generation.generation_id, "YKI_ENGINE_UNREACHABLE");
    throw new Error(
      \`YKI Engine unreachable: \${error instanceof Error ? error.message : "connection failed"}\`,
    );
  }
});

export const getVideoGenerationStatus = createServerFn({
  method: "POST",
}).validator(
  (data: { accessToken: string; generationId: string }) => data,
).handler(async ({ data }) => {
  const response = await supabaseUserFetch(
    \`/rest/v1/generations?select=id,status,provider,provider_job_id,output_url,error_code,credits_reserved,credits_charged,credits_refunded,created_at,completed_at,duration_seconds&id=eq.\${encodeURIComponent(data.generationId)}&limit=1\`,
    data.accessToken,
  );

  if (!response.ok) {
    throw new Error("Unable to read generation status");
  }

  const rows = (await response.json()) as Array<{
    id: string;
    status: string;
    provider: string | null;
    provider_job_id: string | null;
    output_url: string | null;
    error_code: string | null;
    credits_reserved: number;
    credits_charged: number;
    credits_refunded: number;
    created_at: string;
    completed_at: string | null;
    duration_seconds: number;
  }>;

  const generation = rows[0];
  if (!generation) throw new Error("Generation not found");

  const videoUrl =
    generation.status === "completed" &&
    generation.output_url?.startsWith("http")
      ? generation.output_url
      : null;

  return {
    ...generation,
    providerStatus: generation.status,
    videoUrl,
  };
});
