import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseUser, rpcAsSystem, rpcAsUser, supabaseUserFetch } from "./supabase-rest.server";

const model = "google/veo-3.1-fast";
const replicateUrl = `https://api.replicate.com/v1/models/${model}/predictions`;
const inputSchema = z.object({ accessToken: z.string(), prompt: z.string().trim().min(1).max(4000), format: z.enum(["9:16", "16:9", "1:1"]), duration: z.literal("8s"), style: z.enum(["cinematic", "realistic", "anime", "3d"]), generateAudio: z.boolean(), idempotencyKey: z.string().uuid() });
const creditsFor = (seconds: number) => seconds * 4;
function requireReplicate() { const token = process.env.REPLICATE_API_TOKEN; const webhook = process.env.REPLICATE_WEBHOOK_URL; if (!token || !webhook) throw new Error("Video generation is not configured yet. Please contact the workspace administrator."); return { token, webhook }; }
function publicError(error: unknown) { return error instanceof Error ? error.message : "The video could not be started. Please try again."; }

export const createVideoGeneration = createServerFn({ method: "POST" }).validator(inputSchema).handler(async ({ data }) => {
  await requireSupabaseUser(data.accessToken);
  const credits = creditsFor(8);
  const projectId = await rpcAsUser<string>("create_project", data.accessToken, { p_title: data.prompt, p_aspect_ratio: data.format, p_duration_seconds: 8 });
  const reservation = await rpcAsUser<Array<{ generation_id: string; status: string; duplicate: boolean }>>("reserve_generation", data.accessToken, { p_project_id: projectId, p_prompt: data.prompt, p_style: data.style, p_model: model, p_aspect_ratio: data.format, p_duration_seconds: 8, p_generate_audio: data.generateAudio, p_credits: credits, p_idempotency_key: data.idempotencyKey });
  const generation = reservation[0];
  if (!generation?.generation_id) throw new Error("Generation reservation could not be created.");
  if (generation.duplicate) return { generationId: generation.generation_id, status: generation.status, credits, duplicate: true };
  try {
    const { token, webhook } = requireReplicate();
    // veo-3.1-fast supports these documented inputs; do not send UI-only style/model fields.
    const response = await fetch(replicateUrl, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "respond-async" }, body: JSON.stringify({ input: { prompt: data.prompt, aspect_ratio: data.format, duration: 8, generate_audio: data.generateAudio }, webhook, webhook_events_filter: ["completed"] }) });
    if (!response.ok) throw new Error("The video provider could not accept this request.");
    const prediction = await response.json() as { id?: string; status?: string };
    if (!prediction.id) throw new Error("The video provider returned an invalid response.");
    await rpcAsSystem("system_mark_generation_submitted", { p_generation_id: generation.generation_id, p_provider_job_id: prediction.id, p_metadata: prediction });
    return { generationId: generation.generation_id, status: prediction.status ?? "submitted", credits, duplicate: false };
  } catch (error) {
    // This system-only transition is idempotent and refunds the reservation once.
    await rpcAsSystem("system_fail_unsubmitted", { p_generation_id: generation.generation_id, p_error_code: "SUBMISSION_FAILED" });
    throw new Error(publicError(error));
  }
});

export const getStudioState = createServerFn({ method: "POST" }).validator(z.object({ accessToken: z.string() })).handler(async ({ data }) => {
  await requireSupabaseUser(data.accessToken);
  const response = await supabaseUserFetch("/rest/v1/credit_accounts?select=balance,workspaces!inner(id)&limit=1", data.accessToken);
  if (!response.ok) throw new Error("Your credits could not be loaded.");
  const accounts = await response.json() as Array<{ balance: number }>;
  return { credits: accounts[0]?.balance ?? 0, estimatedCost: creditsFor(8) };
});

export const getGeneration = createServerFn({ method: "POST" }).validator(z.object({ accessToken: z.string(), generationId: z.string().uuid() })).handler(async ({ data }) => {
  await requireSupabaseUser(data.accessToken);
  const response = await supabaseUserFetch(`/rest/v1/generations?id=eq.${encodeURIComponent(data.generationId)}&select=id,status,output_url,error_code,project_id`, data.accessToken);
  if (!response.ok) throw new Error("Generation status could not be loaded.");
  const rows = await response.json() as Array<{ id: string; status: string; output_url: string | null; error_code: string | null; project_id: string }>;
  if (!rows[0]) throw new Error("Generation not found.");
  return rows[0];
});

export const enhancePrompt = createServerFn({ method: "POST" }).validator(z.object({ accessToken: z.string(), prompt: z.string().trim().min(1).max(4000) })).handler(async ({ data }) => {
  await requireSupabaseUser(data.accessToken);
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { available: false, prompt: data.prompt, message: "Prompt enhancement is not configured for this workspace yet." };
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-4.1-mini", input: `Rewrite this video idea as one concise, safe production prompt. Preserve the user's intent. Idea: ${data.prompt}` }) });
  if (!response.ok) throw new Error("Prompt enhancement is temporarily unavailable.");
  const body = await response.json() as { output_text?: string };
  return { available: true, prompt: body.output_text?.trim() || data.prompt };
});
