const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_q7sfkEmZcHvt4xTa4DkRPg_GtBkq5DI";

function getSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    "https://dtdygokcjjoprqfjmmcz.supabase.co";

  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  const secretKey = process.env.SUPABASE_SECRET_KEY;

  return { url: url.replace(/\/$/, ""), publishableKey, secretKey };
}

function requirePublishableKey() {
  const { publishableKey } = getSupabaseConfig();

  if (!publishableKey) {
    throw new Error("SUPABASE_PUBLISHABLE_KEY is not configured");
  }

  return publishableKey;
}

function requireSecretKey() {
  const { secretKey } = getSupabaseConfig();

  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not configured");
  }

  return secretKey;
}

export function getUserTokenFromRequest(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice(7);
}

export async function supabaseUserFetch(
  path: string,
  token: string,
  init: RequestInit = {},
) {
  const { url } = getSupabaseConfig();
  const headers = new Headers(init.headers);

  headers.set("apikey", requirePublishableKey());
  headers.set("Authorization", `Bearer ${token}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${url}${path}`, {
    ...init,
    headers,
  });
}

export async function supabaseAdminFetch(
  path: string,
  init: RequestInit = {},
) {
  const { url } = getSupabaseConfig();
  const secretKey = requireSecretKey();
  const headers = new Headers(init.headers);

  headers.set("apikey", secretKey);
  headers.set("Authorization", `Bearer ${secretKey}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${url}${path}`, {
    ...init,
    headers,
  });
}
