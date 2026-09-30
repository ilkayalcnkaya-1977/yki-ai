import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { bindings } from "../bindings.server";

const requestSchema = z.object({
  workspaceId: z.string().uuid(),
  projectId: z.string().uuid(),
  prompt: z.string().trim().min(1).max(10000),
  credits: z.number().int().positive().max(10000),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]),
  durationSeconds: z.number().int().min(1).max(60),
  model: z.string().trim().min(1).max(100),
  idempotencyKey: z.string().uuid(),
});

/**
 * Reserves credits and creates a generation atomically.
 * Provider submission is deliberately a later state transition: a failed
 * provider request can refund the reservation instead of losing credits.
 */
export const reserveGeneration = createServerFn({ method: "POST" })
  .validator(requestSchema)
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) throw new Error("DATABASE_UNAVAILABLE");

    const existing = await DB.prepare(
      "SELECT id, status, credits_reserved FROM generations WHERE idempotency_key = ?1 LIMIT 1",
    ).bind(data.idempotencyKey).first<{ id: string; status: string; credits_reserved: number }>();
    if (existing) return { generationId: existing.id, status: existing.status, duplicate: true } as const;

    const generationId = crypto.randomUUID();
    const ledgerId = crypto.randomUUID();
    const now = new Date().toISOString();

    const result = await DB.batch([
      DB.prepare(
        "UPDATE credit_accounts SET balance = balance - ?1, updated_at = ?2 WHERE workspace_id = ?3 AND balance >= ?1",
      ).bind(data.credits, now, data.workspaceId),
      DB.prepare(
        "INSERT INTO credit_ledger (id, workspace_id, amount, reason, reference_id, created_at) VALUES (?1, ?2, ?3, 'generation_reservation', ?4, ?5)",
      ).bind(ledgerId, data.workspaceId, -data.credits, generationId, now),
      DB.prepare(
        "INSERT INTO generations (id, project_id, status, prompt, credits_reserved, created_at, idempotency_key, model, aspect_ratio, duration_seconds) VALUES (?1, ?2, 'queued', ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
      ).bind(generationId, data.projectId, data.prompt, data.credits, now, data.idempotencyKey, data.model, data.aspectRatio, data.durationSeconds),
    ]);

    const balanceUpdate = result[0];
    if (!balanceUpdate.meta.changes) {
      throw new Error("INSUFFICIENT_CREDITS");
    }

    return { generationId, status: "queued", duplicate: false } as const;
  });

export const refundGeneration = createServerFn({ method: "POST" })
  .validator(z.object({ generationId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) throw new Error("DATABASE_UNAVAILABLE");
    const generation = await DB.prepare(
      "SELECT g.project_id, g.credits_reserved, g.status, p.workspace_id FROM generations g JOIN projects p ON p.id = g.project_id WHERE g.id = ?1",
    ).bind(data.generationId).first<{ project_id:string; credits_reserved:number; status:string; workspace_id:string }>();
    if (!generation || generation.status === "refunded") return { refunded: false } as const;
    if (!generation.credits_reserved) return { refunded: false } as const;
    const now = new Date().toISOString();
    const ledgerId = crypto.randomUUID();
    await DB.batch([
      DB.prepare("UPDATE credit_accounts SET balance = balance + ?1, updated_at = ?2 WHERE workspace_id = ?3").bind(generation.credits_reserved, now, generation.workspace_id),
      DB.prepare("INSERT INTO credit_ledger (id, workspace_id, amount, reason, reference_id, created_at) VALUES (?1, ?2, ?3, 'generation_refund', ?4, ?5)").bind(ledgerId, generation.workspace_id, generation.credits_reserved, data.generationId, now),
      DB.prepare("UPDATE generations SET status = 'refunded', completed_at = ?1 WHERE id = ?2 AND status NOT IN ('completed','refunded')").bind(now, data.generationId),
    ]);
    return { refunded: true } as const;
  });
