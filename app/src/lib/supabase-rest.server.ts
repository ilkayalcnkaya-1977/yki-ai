/** Server-only Supabase REST helpers. Never expose the service-role key. */
function config() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("Supabase is not configured.");
  return { url: url.replace(/\/$/, ""), publishableKey };
}

function serviceKey() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("Supabase service access is not configured.");
  return key;
}

export async function supabaseUserFetch(path: string, token: string, init: RequestInit = {}) {
  const { url, publishableKey } = config();
  const headers = new Headers(init.headers);
  headers.set("apikey", publishableKey);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${url}${path}`, { ...init, headers });
}

export async function supabaseAdminFetch(path: string, init: RequestInit = {}) {
  const { url } = config();
  const key = serviceKey();
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${url}${path}`, { ...init, headers });
}

/** Validates the bearer token with Supabase Auth; never trust an ID from a client. */
export async function requireSupabaseUser(accessToken: string) {
  if (!accessToken || accessToken.length > 10_000) throw new Error("Please sign in to continue.");
  const response = await supabaseUserFetch("/auth/v1/user", accessToken);
  if (!response.ok) throw new Error("Your session has expired. Please sign in again.");
  const user = await response.json() as { id?: string; email?: string };
  if (!user.id) throw new Error("Your session could not be verified.");
  return user as { id: string; email?: string };
}

export async function rpcAsUser<T>(name: string, accessToken: string, args: Record<string, unknown>): Promise<T> {
  const response = await supabaseUserFetch(`/rest/v1/rpc/${name}`, accessToken, { method: "POST", body: JSON.stringify(args) });
  if (!response.ok) throw new Error("The requested operation could not be completed.");
  return response.json() as Promise<T>;
}

export async function rpcAsSystem<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const response = await supabaseAdminFetch(`/rest/v1/rpc/${name}`, { method: "POST", body: JSON.stringify(args) });
  if (!response.ok) throw new Error("The provider update could not be stored.");
  return response.json() as Promise<T>;
}
