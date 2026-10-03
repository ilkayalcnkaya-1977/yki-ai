const SUPABASE_URL = "https://dtdygokcjjoprqfjmmcz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_q7sfkEmZcHvt4xTa4DkRPg_GtBkq5DI";

const ACCESS_TOKEN_KEY = "ykiai_access_token";
const REFRESH_TOKEN_KEY = "ykiai_refresh_token";

type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  user?: { id: string; email?: string; user_metadata?: Record<string, unknown> };
};

async function authRequest(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  headers.set("Content-Type", "application/json");
  return fetch(SUPABASE_URL + "/auth/v1/" + path, { ...init, headers });
}

async function restRequest(path: string, accessToken: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  headers.set("Authorization", "Bearer " + accessToken);
  headers.set("Content-Type", "application/json");
  return fetch(SUPABASE_URL + "/rest/v1/" + path, { ...init, headers });
}

export async function signUp(email: string, password: string, displayName: string) {
  const response = await authRequest("signup", {
    method: "POST",
    body: JSON.stringify({ email, password, data: { full_name: displayName } }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || "Kayıt oluşturulamadı.");
  if (data?.access_token) saveSession(data as AuthSession);
  return data as AuthSession & { id?: string };
}

export async function signIn(email: string, password: string) {
  const response = await authRequest("token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || "E-posta veya şifre hatalı.");
  saveSession(data as AuthSession);
  return data as AuthSession;
}

export function saveSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function refreshSession() {
  const refreshToken =
    typeof window === "undefined"
      ? null
      : localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) return null;

  const response = await authRequest("token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await response.json();

  if (!response.ok || !data?.access_token) {
    clearSession();
    return null;
  }

  saveSession(data as AuthSession);
  return data as AuthSession;
}

export async function getCurrentUser() {
  const accessToken = getAccessToken();
  if (!accessToken) return null;
  const response = await authRequest("user", { headers: { Authorization: "Bearer " + accessToken } });
  if (!response.ok) {
    clearSession();
    return null;
  }
  return response.json() as Promise<{ id: string; email?: string; user_metadata?: Record<string, unknown> }>;
}

export async function getCreditBalance(accessToken?: string) {
  const token = accessToken ?? getAccessToken();
  if (!token) return null;

  const workspaceResponse = await restRequest(
    "workspaces?select=id&limit=1",
    token,
  );

  if (!workspaceResponse.ok) return null;

  const workspaces = (await workspaceResponse.json()) as Array<{ id: string }>;
  const workspace = workspaces[0];
  if (!workspace) return null;

  const balanceResponse = await restRequest(
    `credit_accounts?select=balance&workspace_id=eq.${workspace.id}&limit=1`,
    token,
  );

  if (!balanceResponse.ok) return null;

  const rows = (await balanceResponse.json()) as Array<{ balance: number }>;
  return rows[0]?.balance ?? 0;
}
