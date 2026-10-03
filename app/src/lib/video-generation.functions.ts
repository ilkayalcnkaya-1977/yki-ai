import {
  createServerFn,
  createServerOnlyFn,
} from "@tanstack/react-start";
import { supabaseUserFetch } from "./supabase-rest.server";

const REPLICATE_API_URL =
  "https://api.replicate.com/v1/models/google/veo-3.1-fast/predictions";

const MODEL = "google/veo-3.1-fast";

// YKI AI kredi sistemi
// MVP: 4 kredi / saniye
const CREDITS_PER_SECOND = 4;

const requireReplicateToken = createServerOnlyFn(() => {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    throw new Error("REPLICATE_API_TOKEN is not configured");
  }

  return token;
});

const requireWebhookUrl = createServerOnlyFn(() => {
  const url = process.env.REPLICATE_WEBHOOK_URL;

  if (!url) {
    throw new Error("REPLICATE_WEBHOOK_URL is not configured");
  }

  return url;
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

  // Validate provider configuration before creating a project or reserving
  // credits. A missing production secret must not leave a charged generation.
  const replicateToken = requireReplicateToken();
  const webhookUrl = requireWebhookUrl();

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
        p_model: MODEL,
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
   * 5. Replicate üzerinde gerçek video üretimini başlat
   */
  const replicateResponse = await fetch(
    REPLICATE_API_URL,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${replicateToken}`,
        "Content-Type": "application/json",
        Prefer: "respond-async",
      },

      body: JSON.stringify({
        input: {
          prompt,
          aspect_ratio: data.format,
          duration: durationSeconds,
          resolution,
          generate_audio: generateAudio,
        },

        webhook: webhookUrl,

        webhook_events_filter: [
          "completed",
        ],
      }),
    },
  );

  if (!replicateResponse.ok) {
    const errorText =
      await replicateResponse.text();

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

    let providerMessage = errorText;

    try {
      const payload = JSON.parse(errorText) as {
        title?: string;
        detail?: string;
        status?: number;
      };

      if (
        payload.status === 402 ||
        payload.title?.toLowerCase().includes("insufficient credit") ||
        payload.detail?.toLowerCase().includes("insufficient credit")
      ) {
        providerMessage =
          "Replicate hesabında sağlayıcı kredisi yok. YKI AI krediniz geri iade edildi. Replicate Billing'den sağlayıcı bakiyesini yükledikten sonra tekrar deneyin.";
      }
    } catch {
      if (errorText.toLowerCase().includes("insufficient credit")) {
        providerMessage =
          "Replicate hesabında sağlayıcı kredisi yok. YKI AI krediniz geri iade edildi. Replicate Billing'den sağlayıcı bakiyesini yükledikten sonra tekrar deneyin.";
      }
    }

    throw new Error(`Video provider error: ${providerMessage}`);
  }

  const prediction =
    (await replicateResponse.json()) as {
      id: string;
      status: string;
    };

  /*
   * 6. Replicate job ID'sini Supabase'e kaydet
   */
  const submittedResponse =
    await supabaseUserFetch(
      "/rest/v1/rpc/system_mark_generation_submitted",
      data.accessToken,
      {
        method: "POST",

        body: JSON.stringify({
          p_generation_id:
            generation.generation_id,

          p_provider_job_id:
            prediction.id,

          p_model_version:
            MODEL,
        }),
      },
    );

  if (!submittedResponse.ok) {
    throw new Error(
      "Provider job was created but generation could not be marked as submitted",
    );
  }

  /*
   * 7. Studio'ya sonucu döndür
   */
  return {
    generationId:
      generation.generation_id,

    providerJobId:
      prediction.id,

    status:
      prediction.status,

    credits,

    duplicate: false,
  };
});
