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

  const requestUrl = `${url}${path}`;

  // Supabase can intermittently reject a fresh authenticated JWT with
  // PGRST303 ("JWT issued at future"). Retry that transient error.
  const delays = [0, 500, 1000, 2000];

  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    if (delays[attempt] > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, delays[attempt]),
      );
    }

    const response = await fetch(requestUrl, {
      ...init,
      headers,
    });

    if (response.status !== 401) {
      return response;
    }

    const text = await response.text();
    let isJwtTimingError = false;

    try {
      const payload = JSON.parse(text) as {
        code?: string;
        message?: string;
      };

      isJwtTimingError =
        payload.code === "PGRST303" ||
        payload.message === "JWT issued at future";
    } catch {
      isJwtTimingError =
        text.includes("PGRST303") ||
        text.includes("JWT issued at future");
    }

    if (!isJwtTimingError || attempt === delays.length - 1) {
      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
  }

  throw new Error("Supabase request retry failed");
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
