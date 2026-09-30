import { createServerFn } from "@tanstack/react-start";
import { bindings } from "../bindings.server";

export const getPlatformHealth = createServerFn({ method: "GET" }).handler(async () => {
  const { DB } = bindings();
  if (!DB) return { ok: false, database: false } as const;
  const row = await DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
  return { ok: row?.ok === 1, database: true } as const;
});
