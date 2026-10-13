import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/runtime-health")({
  server: {
    handlers: {
      GET: async () => {
        const checks = {
          supabaseUrl: Boolean(
            process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
          ),
          supabasePublishableKey: Boolean(
            process.env.SUPABASE_PUBLISHABLE_KEY ??
              process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          ),
          supabaseSecretKey: Boolean(process.env.SUPABASE_SECRET_KEY),
          ykiEngineConfigured: Boolean(
            process.env.YKI_ENGINE_URL && process.env.YKI_ENGINE_API_KEY,
          ),
          runpodFallbackConfigured: Boolean(
            process.env.RUNPOD_API_KEY && process.env.RUNPOD_ENDPOINT_ID,
          ),
        };

        const generationProviderConfigured =
          checks.ykiEngineConfigured || checks.runpodFallbackConfigured;

        return Response.json(
          {
            ok:
              checks.supabaseUrl &&
              checks.supabasePublishableKey &&
              checks.supabaseSecretKey &&
              generationProviderConfigured,
            checks: {
              ...checks,
              generationProviderConfigured,
            },
            deployment: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
            },
          },
        );
      },
    },
  },
});
