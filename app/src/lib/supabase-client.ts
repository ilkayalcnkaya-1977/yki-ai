const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const ACCESS_TOKEN_KEY = "ykiai_access_token";
const REFRESH_TOKEN_KEY = "ykiai_refresh_token";

type AuthSession = { access_token: string; refresh_token: string; expires_in?: number; user?: { id: string; email?: string; user_metadata?: Record<string, unknown> } };
function requireConfig() { if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) throw new Error("Supabase authentication is not configured."); return { url: SUPABASE_URL, key: SUPABASE_PUBLISHABLE_KEY }; }
async function authRequest(path: string, init: RequestInit = {}) { const { url, key } = requireConfig(); const headers = new Headers(init.headers); headers.set("apikey", key); headers.set("Content-Type", "application/json"); return fetch(`${url}/auth/v1/${path}`, { ...init, headers }); }
export async function signUp(email: string, password: string, displayName: string) { const response = await authRequest("signup", { method: "POST", body: JSON.stringify({ email, password, data: { full_name: displayName } }) }); const data = await response.json(); if (!response.ok) throw new Error(data?.msg || data?.message || "Kayıt oluşturulamadı."); if (data?.access_token) saveSession(data); return data as AuthSession; }
export async function signIn(email: string, password: string) { const response = await authRequest("token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) }); const data = await response.json(); if (!response.ok) throw new Error(data?.msg || data?.message || "E-posta veya şifre hatalı."); saveSession(data); return data as AuthSession; }
export function saveSession(session: AuthSession) { if (typeof window === "undefined") return; localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token); localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token); }
export function clearSession() { if (typeof window === "undefined") return; localStorage.removeItem(ACCESS_TOKEN_KEY); localStorage.removeItem(REFRESH_TOKEN_KEY); }
export function getAccessToken() { return typeof window === "undefined" ? null : localStorage.getItem(ACCESS_TOKEN_KEY); }
export async function getCurrentUser() { const accessToken = getAccessToken(); if (!accessToken) return null; const response = await authRequest("user", { headers: { Authorization: `Bearer ${accessToken}` } }); if (!response.ok) { clearSession(); return null; } return response.json() as Promise<{ id: string; email?: string; user_metadata?: Record<string, unknown> }>; }
