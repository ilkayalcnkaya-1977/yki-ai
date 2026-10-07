import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { supabaseAdminFetch, supabaseUserFetch } from "./supabase-rest.server";

const YKI_ENGINE_MODEL = "wan2.2-ti2v-5b";
const CREDITS_PER_SECOND = 4;

const getGenerationConfig = createServerOnlyFn(() => ({
  engineUrl: process.env.YKI_ENGINE_URL?.replace(/\/$/, "") ?? "",
  engineKey: process.env.YKI_ENGINE_API_KEY ?? "",
  runpodApiKey: process.env.RUNPOD_API_KEY ?? "",
  runpodEndpointId: process.env.RUNPOD_ENDPOINT_ID ?? "",
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
  const response = await supabaseAdminFetch("/rest/v1/rpc/system_fail_generation", {
    method: "POST",
    body: JSON.stringify({ p_generation_id: generationId, p_error_code: errorCode.slice(0, 200) }),
  });
  if (!response.ok) console.error("Failed to refund generation", generationId, await response.text());
}

async function setProviderJob(generationId: string, provider: "yki_engine" | "runpod", jobId: string) {
  const response = await supabaseAdminFetch(
    `/rest/v1/generations?id=eq.${encodeURIComponent(generationId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ provider, provider_job_id: jobId, model: YKI_ENGINE_MODEL, model_version: YKI_ENGINE_MODEL }),
    },
  );
  if (!response.ok) throw new Error(`Unable to record provider job: ${await response.text()}`);
}

async function completeExternalGeneration(generationId: string, providerRequestId: string, videoUrl: string, durationSeconds: number) {
  const response = await supabaseAdminFetch("/rest/v1/rpc/system_complete_external_generation", {
    method: "POST",
    body: JSON.stringify({
      p_generation_id: generationId,
      p_provider_event_id: providerRequestId,
      p_output_url: videoUrl,
      p_actual_duration_seconds: durationSeconds,
      p_provider_cost_usd: 0,
    }),
  });
  if (!response.ok) throw new Error(`Unable to finalize generation: ${await response.text()}`);
}

function extractRunpodVideoUrl(output: unknown): string | null {
  if (!output || typeof output !== "object") return null;
  const value = output as Record<string, unknown>;
  const video = typeof value.video === "object" && value.video ? value.video as Record<string, unknown> : null;
  const candidates = [value.video_url, value.url, value.output_url, video?.url, typeof value.video === "string" ? value.video : null];
  return candidates.find((candidate): candidate is string =>
    typeof candidate === "string" && candidate.startsWith("http"),
  ) ?? null;
}

async function runpodRequest(endpointId: string, apiKey: string, input: Record<string, unknown>) {
  const response = await fetch(
    `https://api.runpod.ai/v2/${encodeURIComponent(endpointId)}/run`,
    {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    },
  );
  if (!response.ok) throw new Error(`RunPod rejected generation: ${await response.text()}`);
  return (await response.json()) as { id?: string; status?: string };
}

async function getRunpodStatus(endpointId: string, apiKey: string, jobId: string) {
  const response = await fetch(
    `https://api.runpod.ai/v2/${encodeURIComponent(endpointId)}/status/${encodeURIComponent(jobId)}`,
    { headers: { Authorization: "Bearer " + apiKey } },
  );
  if (!response.ok) throw new Error("Unable to read RunPod generation status");
  return (await response.json()) as { id?: string; status?: string; output?: unknown; error?: string };
}

export const createVideoGeneration = createServerFn({ method: "POST" })
  .validator((data: {
    accessToken: string; prompt: string; format: string; duration: string; style?: string; generateAudio?: boolean;
  }) => data)
  .handler(async ({ data }) => {
    const prompt = data.prompt.trim();
    if (!prompt) throw new Error("Prompt is required");
    if (prompt.length > 4000) throw new Error("Prompt is too long");

    const durationSeconds = getDurationSeconds(data.duration);
    const aspectRatio = getAspectRatio(data.format);
    const generateAudio = data.generateAudio !== false;
    const config = getGenerationConfig();
    const useEngine = Boolean(config.engineUrl && config.engineKey);
    const useRunpod = Boolean(config.runpodApiKey && config.runpodEndpointId);

    if (!useEngine && !useRunpod) {
      throw new Error("YKI GPU engine is not configured. Add the YKI Engine or RunPod production credentials.");
    }

    const credits = durationSeconds * CREDITS_PER_SECOND;
    const workspaceResponse = await supabaseUserFetch("/rest/v1/workspaces?select=id&limit=1", data.accessToken);
    if (!workspaceResponse.ok) throw new Error(`Unable to load workspace: ${await workspaceResponse.text()}`);
    const workspaces = (await workspaceResponse.json()) as Array<{ id: string }>;
    const workspace = workspaces[0];
    if (!workspace) throw new Error("No workspace found for this account");

    const projectResponse = await supabaseUserFetch("/rest/v1/rpc/create_project", data.accessToken, {
      method: "POST",
      body: JSON.stringify({
        p_workspace_id: workspace.id,
        p_title: prompt.slice(0, 80),
        p_aspect_ratio: aspectRatio,
        p_duration_seconds: durationSeconds,
      }),
    });
    if (!projectResponse.ok) throw new Error(`Unable to create project: ${await projectResponse.text()}`);

    const projectId = (await projectResponse.json()) as string;
    const idempotencyKey = crypto.randomUUID();
    const reserveResponse = await supabaseUserFetch("/rest/v1/rpc/reserve_generation", data.accessToken, {
      method: "POST",
      body: JSON.stringify({
        p_workspace_id: workspace.id,
        p_project_id: projectId,
        p_prompt: prompt,
        p_credits: credits,
        p_model: YKI_ENGINE_MODEL,
        p_aspect_ratio: aspectRatio,
        p_duration_seconds: durationSeconds,
        p_idempotency_key: idempotencyKey,
      }),
    });
    if (!reserveResponse.ok) throw new Error(`Credit reservation failed: ${await reserveResponse.text()}`);

    const reservation = (await reserveResponse.json()) as Array<{ generation_id: string; status: string; duplicate: boolean }>;
    const generation = reservation[0];
    if (!generation?.generation_id) throw new Error("Generation reservation returned no generation ID");
    if (generation.duplicate) return { generationId: generation.generation_id, status: generation.status, duplicate: true, credits };

    const optionsResponse = await supabaseUserFetch("/rest/v1/rpc/system_set_generation_options", data.accessToken, {
      method: "POST",
      body: JSON.stringify({
        p_generation_id: generation.generation_id,
        p_resolution: "720p",
        p_generate_audio: generateAudio,
        p_model_version: YKI_ENGINE_MODEL,
      }),
    });
    if (!optionsResponse.ok) {
      await refundGeneration(generation.generation_id, "GENERATION_SETUP_FAILED");
      throw new Error(`Generation setup failed: ${await optionsResponse.text()}`);
    }

    try {
      let provider: "yki_engine" | "runpod";
      let jobId: string | undefined;
      let status = "starting";

      if (useEngine) {
        provider = "yki_engine";
        const engineResponse = await fetch(`${config.engineUrl}/v1/generations`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-YKI-Engine-Key": config.engineKey },
          body: JSON.stringify({
            generation_id: generation.generation_id,
            prompt,
            style: data.style ?? "cinematic",
            aspect_ratio: aspectRatio,
            duration_seconds: durationSeconds,
            generate_audio: false,
          }),
        });
        if (!engineResponse.ok) throw new Error(`YKI Engine rejected generation: ${await engineResponse.text()}`);
        const engineJob = (await engineResponse.json()) as { job_id?: string; status?: string };
        jobId = engineJob.job_id;
        status = engineJob.status ?? "starting";
      } else {
        provider = "runpod";
        const runpodJob = await runpodRequest(config.runpodEndpointId, config.runpodApiKey, {
          generation_id: generation.generation_id,
          prompt,
          model: YKI_ENGINE_MODEL,
          style: data.style ?? "cinematic",
          aspect_ratio: aspectRatio,
          duration_seconds: durationSeconds,
          generate_audio: false,
        });
        jobId = runpodJob.id;
        status = runpodJob.status ?? "IN_QUEUE";
      }

      if (!jobId) throw new Error("GPU provider returned no job ID");
      await setProviderJob(generation.generation_id, provider, jobId);

      return { generationId: generation.generation_id, providerJobId: jobId, status, credits, duplicate: false };
    } catch (error) {
      await refundGeneration(generation.generation_id, error instanceof Error && error.message.includes("RunPod") ? "RUNPOD_REJECTED" : "YKI_ENGINE_REJECTED");
      throw error instanceof Error ? error : new Error("Generation failed");
    }
  });

export const getVideoGenerationStatus = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string; generationId: string }) => data)
  .handler(async ({ data }) => {
    const response = await supabaseUserFetch(
      `/rest/v1/generations?select=id,status,provider,provider_job_id,output_url,error_code,credits_reserved,credits_charged,credits_refunded,created_at,completed_at,duration_seconds&id=eq.${encodeURIComponent(data.generationId)}&limit=1`,
      data.accessToken,
    );
    if (!response.ok) throw new Error("Unable to read generation status");

    const rows = (await response.json()) as Array<{
      id: string; status: string; provider: string | null; provider_job_id: string | null;
      output_url: string | null; error_code: string | null; credits_reserved: number;
      credits_charged: number; credits_refunded: number; created_at: string;
      completed_at: string | null; duration_seconds: number;
    }>;
    const generation = rows[0];
    if (!generation) throw new Error("Generation not found");

    let providerStatus = generation.status;
    let videoUrl = generation.status === "completed" && generation.output_url?.startsWith("http") ? generation.output_url : null;

    if (generation.provider === "runpod" && generation.provider_job_id && !["completed", "refunded"].includes(generation.status)) {
      const config = getGenerationConfig();
      if (!config.runpodApiKey || !config.runpodEndpointId) throw new Error("RunPod status configuration is missing");

      const providerResult = await getRunpodStatus(config.runpodEndpointId, config.runpodApiKey, generation.provider_job_id);
      providerStatus = providerResult.status ?? generation.status;
      const normalized = String(providerResult.status ?? "").toUpperCase();

      if (normalized === "COMPLETED") {
        videoUrl = extractRunpodVideoUrl(providerResult.output);
        if (!videoUrl) {
          await refundGeneration(generation.id, "RUNPOD_NO_VIDEO_URL");
        } else {
          await completeExternalGeneration(generation.id, generation.provider_job_id, videoUrl, generation.duration_seconds);
        }
      } else if (["FAILED", "CANCELLED", "TIMED_OUT"].includes(normalized)) {
        await refundGeneration(generation.id, `RUNPOD_${normalized}`);
      }
    }

    const finalResponse = await supabaseUserFetch(
      `/rest/v1/generations?select=id,status,provider,provider_job_id,output_url,error_code,credits_reserved,credits_charged,credits_refunded,created_at,completed_at,duration_seconds&id=eq.${encodeURIComponent(data.generationId)}&limit=1`,
      data.accessToken,
    );
    const finalRows = finalResponse.ok ? ((await finalResponse.json()) as typeof rows) : rows;
    const finalGeneration = finalRows[0] ?? generation;
    if (!videoUrl && finalGeneration.status === "completed" && finalGeneration.output_url?.startsWith("http")) videoUrl = finalGeneration.output_url;

    return { ...finalGeneration, providerStatus, videoUrl };
  });
