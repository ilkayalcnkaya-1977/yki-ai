import {
  createServerFn,
  createServerOnlyFn,
} from "@tanstack/react-start";
import { supabaseAdminFetch, supabaseUserFetch } from "./supabase-rest.server";

const HIGGSFIELD_MODEL = "kling-video/v3.0-turbo/text-to-video";
const YKI_ENGINE_MODEL = "wan2.2-ti2v-5b";
const HIGGSFIELD_API_BASE = "https://api.higgsfield.ai";
const CREDITS_PER_SECOND = 4;

const getYkiEngine = createServerOnlyFn(() => ({
  url: process.env.YKI_ENGINE_URL?.replace(/\/$/, "") ?? "",
  apiKey: process.env.YKI_ENGINE_API_KEY ?? "",
}));

const requireHiggsfield = createServerOnlyFn(() => {
  const apiKey = process.env.HF_API_KEY;

  if (!apiKey) {
    throw new Error("Higgsfield API is not configured");
  }

  return { apiKey };
});

function getDurationSeconds(value: string) {
  if (value === "5s") return 5;
  if (value === "8s") return 8;
  throw new Error("Only 5 or 8 second generation is currently enabled");
}

function getAspectRatio(format: string) {
  if (format === "9:16" || format === "16:9" || format === "1:1") {
    return format;
  }

  return "9:16";
}

async function higgsfieldRequest(
  path: string,
  apiKey: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Key ${apiKey}`);
  headers.set("Content-Type", "application/json");

  return fetch(`${HIGGSFIELD_API_BASE}${path}`, {
    ...init,
    headers,
  });
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

async function completeExternalGeneration(
  generationId: string,
  providerRequestId: string,
  videoUrl: string,
  durationSeconds: number,
) {
  const response = await supabaseAdminFetch(
    "/rest/v1/rpc/system_complete_external_generation",
    {
      method: "POST",
      body: JSON.stringify({
        p_generation_id: generationId,
        p_provider_event_id: providerRequestId,
        p_output_url: videoUrl,
        p_actual_duration_seconds: durationSeconds,
        p_provider_cost_usd: 0,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Unable to finalize Higgsfield generation: ${await response.text()}`,
    );
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
  const useYkiEngine = Boolean(ykiEngine.url && ykiEngine.apiKey);
  const model = useYkiEngine ? YKI_ENGINE_MODEL : HIGGSFIELD_MODEL;
  const credits = durationSeconds * CREDITS_PER_SECOND;

  const workspaceResponse = await supabaseUserFetch(
    "/rest/v1/workspaces?select=id&limit=1",
    data.accessToken,
  );

  if (!workspaceResponse.ok) {
    throw new Error(`Unable to load workspace: ${await workspaceResponse.text()}`);
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
    throw new Error(`Unable to create project: ${await projectResponse.text()}`);
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
    throw new Error(`Credit reservation failed: ${await reserveResponse.text()}`);
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
      `Generation setup failed: ${await updateGenerationResponse.text()}`,
    );
  }

  if (useYkiEngine) {
    try {
      const engineResponse = await fetch(`${ykiEngine.url}/v1/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-YKI-Engine-Key": ykiEngine.apiKey,
        },
        body: JSON.stringify({
          generation_id: generation.generation_id,
          prompt,
          aspect_ratio: aspectRatio,
          duration_seconds: durationSeconds,
          generate_audio: false,
        }),
      });

      if (!engineResponse.ok) {
        const errorText = await engineResponse.text();
        await refundGeneration(generation.generation_id, "YKI_ENGINE_REJECTED");
        throw new Error(`YKI Engine rejected generation: ${errorText}`);
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
        `YKI Engine unreachable: ${error instanceof Error ? error.message : "connection failed"}`,
      );
    }
  }

  const higgsfield = requireHiggsfield();
  let providerResponse: Response;

  try {
    providerResponse = await higgsfieldRequest(
      "/kling-video/v3.0-turbo/text-to-video",
      higgsfield.apiKey,
      {
        method: "POST",
        body: JSON.stringify({
          prompt,
          duration: durationSeconds,
          aspect_ratio: aspectRatio,
          sound: generateAudio ? "on" : "off",
          cfg_scale: 0.5,
          multi_shots: false,
        }),
      },
    );
  } catch (error) {
    await refundGeneration(
      generation.generation_id,
      "HIGGSFIELD_UNREACHABLE",
    );
    throw new Error(
      `Higgsfield API unreachable: ${error instanceof Error ? error.message : "connection failed"}`,
    );
  }

  if (!providerResponse.ok) {
    const errorText = await providerResponse.text();
    await refundGeneration(generation.generation_id, "HIGGSFIELD_REJECTED");
    throw new Error(`Higgsfield rejected generation: ${errorText}`);
  }

  const providerJob = (await providerResponse.json()) as {
    request_id?: string;
    status?: string;
  };

  if (!providerJob.request_id) {
    await refundGeneration(generation.generation_id, "HIGGSFIELD_NO_REQUEST_ID");
    throw new Error("Higgsfield returned no request ID");
  }

  const acceptResponse = await supabaseAdminFetch(
    "/rest/v1/rpc/system_accept_higgsfield_generation",
    {
      method: "POST",
      body: JSON.stringify({
        p_generation_id: generation.generation_id,
        p_provider_job_id: providerJob.request_id,
        p_model_version: HIGGSFIELD_MODEL,
      }),
    },
  );

  if (!acceptResponse.ok) {
    await refundGeneration(generation.generation_id, "HIGGSFIELD_ACCEPT_FAILED");
    throw new Error(
      `Unable to record Higgsfield request: ${await acceptResponse.text()}`,
    );
  }

  return {
    generationId: generation.generation_id,
    providerJobId: providerJob.request_id,
    status: providerJob.status ?? "queued",
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
    `/rest/v1/generations?select=id,status,provider,provider_job_id,output_url,error_code,credits_reserved,credits_charged,credits_refunded,created_at,completed_at,duration_seconds&id=eq.${encodeURIComponent(data.generationId)}&limit=1`,
    data.accessToken,
  );

  if (!response.ok) throw new Error("Unable to read generation status");

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

  let videoUrl: string | null = null;
  let providerStatus: string | null = null;

  if (generation.provider === "yki_engine") {
    providerStatus = generation.status;
  }

  if (
    generation.provider === "higgsfield" &&
    generation.provider_job_id &&
    generation.status !== "completed" &&
    generation.status !== "refunded"
  ) {
    const higgsfield = requireHiggsfield();
    const statusResponse = await higgsfieldRequest(
      `/requests/${encodeURIComponent(generation.provider_job_id)}/status`,
      higgsfield.apiKey,
      { method: "GET" },
    );

    if (!statusResponse.ok) {
      throw new Error("Unable to read Higgsfield generation status");
    }

    const providerResult = (await statusResponse.json()) as {
      status?: string;
      video?: { url?: string };
      error?: { code?: string; message?: string } | string;
    };

    providerStatus = providerResult.status ?? null;

    if (providerResult.status === "completed" && providerResult.video?.url) {
      videoUrl = providerResult.video.url;

      await completeExternalGeneration(
        generation.id,
        generation.provider_job_id,
        videoUrl,
        generation.duration_seconds,
      );
    } else if (
      providerResult.status === "failed" ||
      providerResult.status === "nsfw" ||
      providerResult.status === "canceled"
    ) {
      const providerError =
        typeof providerResult.error === "string"
          ? providerResult.error
          : providerResult.error?.code ??
            providerResult.error?.message ??
            providerResult.status;

      await refundGeneration(
        generation.id,
        `HIGGSFIELD_${String(providerError).slice(0, 150)}`,
      );
    }
  }

  if (!videoUrl && generation.status === "completed" && generation.output_url) {
    videoUrl = generation.output_url.startsWith("http")
      ? generation.output_url
      : null;
  }

  const finalResponse = await supabaseUserFetch(
    `/rest/v1/generations?select=id,status,provider,provider_job_id,output_url,error_code,credits_reserved,credits_charged,credits_refunded,created_at,completed_at,duration_seconds&id=eq.${encodeURIComponent(data.generationId)}&limit=1`,
    data.accessToken,
  );

  const finalRows = finalResponse.ok
    ? ((await finalResponse.json()) as typeof rows)
    : rows;

  const finalGeneration = finalRows[0] ?? generation;

  if (!videoUrl && finalGeneration.status === "completed" && finalGeneration.output_url) {
    videoUrl = finalGeneration.output_url.startsWith("http")
      ? finalGeneration.output_url
      : null;
  }

  return {
    ...finalGeneration,
    providerStatus,
    videoUrl,
  };
});
