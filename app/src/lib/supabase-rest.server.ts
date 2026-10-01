const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  "https://dtdygokcjjoprqfjmmcz.supabase.co";

const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

function requireSecretKey() {
  if (!SUPABASE_SECRET_KEY) {
    throw new Error("SUPABASE_SECRET_KEY is not configured");
  }

  return SUPABASE_SECRET_KEY;
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
  const headers = new Headers(init.headers);

  headers.set("apikey", requireSecretKey());
  headers.set("Authorization", `Bearer ${token}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers,
  });
}

export async function supabaseAdminFetch(
  path: string,
  init: RequestInit = {},
) {
  const secretKey = requireSecretKey();
  const headers = new Headers(init.headers);

  headers.set("apikey", secretKey);
  headers.set("Authorization", `Bearer ${secretKey}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers,
  });
}
