import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/runtime-health")({
  server: {
    handlers: {
      GET: async () => {
        // These checks report configuration presence only; they do not start
        // a paid GPU job or expose any secret values.
        const checks = {
          supabaseUrl: Boolean(
            process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
          ),
          supabasePublishableKey: Boolean(
            process.env.SUPABASE_PUBLISHABLE_KEY ??
              process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          ),
          supabaseSecretKey: Boolean(process.env.SUPABASE_SECRET_KEY),
          replicateApiToken: Boolean(process.env.REPLICATE_API_TOKEN),
          replicateWebhookUrl: Boolean(process.env.REPLICATE_WEBHOOK_URL),
          replicateWebhookSecret: Boolean(process.env.REPLICATE_WEBHOOK_SECRET),
          ykiEngineUrl: Boolean(process.env.YKI_ENGINE_URL),
          ykiEngineApiKey: Boolean(process.env.YKI_ENGINE_API_KEY),
        };

        // The current Studio generation implementation submits to Replicate.
        // Keep the active provider explicit so a configured but unused engine
        // cannot make Studio appear ready.
        const generationProviderConfigured =
          checks.replicateApiToken && checks.replicateWebhookUrl;
        const ok =
          checks.supabaseUrl &&
          checks.supabasePublishableKey &&
          checks.supabaseSecretKey &&
          generationProviderConfigured;

        return Response.json(
          {
            ok,
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
