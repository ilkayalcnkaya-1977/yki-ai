// Optional runtime bindings shared by server-only code.
// No platform-specific runtime import here: the same app must build on
// Cloudflare Workers, Vercel, and Node-compatible runtimes.

import type {
  D1Database,
  DurableObjectNamespace,
  KVNamespace,
  R2Bucket,
} from "@cloudflare/workers-types";

type AppEnv = {
  DB?: D1Database;
  STORAGE?: R2Bucket;
  KV?: KVNamespace;
  CONTAINER?: DurableObjectNamespace;
  HF_ENV?: string;
  APP_SLUG?: string;
};

type RuntimeGlobals = typeof globalThis & {
  __YKI_BINDINGS__?: AppEnv;
};

export function bindings(): AppEnv {
  return (globalThis as RuntimeGlobals).__YKI_BINDINGS__ ?? {};
}
