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
          replicateApiToken: Boolean(process.env.REPLICATE_API_TOKEN),
          replicateWebhookUrl: Boolean(process.env.REPLICATE_WEBHOOK_URL),
        };

        return Response.json(
          {
            ok: Object.values(checks).every(Boolean),
            checks,
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
