import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://ykiai.com.tr",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const plans = {
  starter: { name: "Starter", credits: 250, amount: 19900 },
  creator: { name: "Creator", credits: 750, amount: 49900 },
  pro: { name: "Pro", credits: 2000, amount: 99900 },
} as const;

const env = (key: string) => Deno.env.get(key) ?? "";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });

async function hmacBase64(key: string, message: string) {
  const cryptoKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function supabase(path: string, init: RequestInit = {}) {
  const url = env("SUPABASE_URL");
  const service = env("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(url + path, {
    ...init,
    headers: { apikey: service, Authorization: "Bearer " + service, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  return response;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);

  // PayTR server-to-server notification endpoint. Do not trust browser redirects.
  if (url.pathname.endsWith("/callback")) {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    const form = await req.formData();
    const merchantOid = String(form.get("merchant_oid") ?? "");
    const status = String(form.get("status") ?? "");
    const totalAmount = String(form.get("total_amount") ?? "");
    const receivedHash = String(form.get("hash") ?? "");
    const expectedHash = await hmacBase64(env("PAYTR_MERCHANT_KEY"), merchantOid + env("PAYTR_MERCHANT_SALT") + status + totalAmount);
    if (!merchantOid || !/^[0-9]+$/.test(totalAmount) || !safeEqual(receivedHash, expectedHash)) {
      return new Response("BAD", { status: 400 });
    }

    if (status === "success") {
      const amount = Number(totalAmount);
      if (!Number.isSafeInteger(amount) || amount < 0) return new Response("BAD", { status: 400 });
      const response = await supabase("/rest/v1/rpc/apply_paytr_purchase", {
        method: "POST",
        body: JSON.stringify({ p_merchant_oid: merchantOid, p_total_amount: amount }),
      });
      if (!response.ok) return new Response("RETRY", { status: 500 });
      const result = await response.json();
      if (result === "not_found" || result === "amount_mismatch" || result === "not_pending") {
        return new Response("BAD", { status: 400 });
      }
    } else {
      await supabase("/rest/v1/purchases?external_payment_id=eq." + encodeURIComponent(merchantOid) + "&status=eq.pending", {
        method: "PATCH", body: JSON.stringify({ status: "failed" }), headers: { Prefer: "return=minimal" },
      });
    }
    return new Response("OK", { status: 200 });
  }

  // Authenticated purchase creation endpoint.
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return json({ error: "Sign in required" }, 401);

  const payload = await req.json().catch(() => null);
  const planKey = payload?.plan as keyof typeof plans;
  if (!Object.hasOwn(plans, planKey)) return json({ error: "Invalid plan" }, 400);
  const plan = plans[planKey];

  const userResponse = await fetch(env("SUPABASE_URL") + "/auth/v1/user", {
    headers: { apikey: env("SUPABASE_ANON_KEY"), Authorization: auth },
  });
  if (!userResponse.ok) return json({ error: "Invalid session" }, 401);
  const user = await userResponse.json();
  if (!user?.id || !user?.email) return json({ error: "Verified account email required" }, 400);
  const userPhone = String(user.user_metadata?.phone ?? user.phone ?? "").trim();
  if (!userPhone) return json({ error: "PayTR ödeme adımı için hesabındaki telefon numarasını tamamla." }, 400);

  const workspacesResponse = await supabase("/rest/v1/workspaces?select=id&owner_user_id=eq." + encodeURIComponent(user.id) + "&limit=1");
  if (!workspacesResponse.ok) return json({ error: "Workspace lookup failed" }, 500);
  const workspaces = await workspacesResponse.json();
  const workspace = workspaces[0];
  if (!workspace?.id) return json({ error: "No workspace found for account" }, 400);

  const merchantOid = "YK" + crypto.randomUUID().replaceAll("-", "").slice(0, 28);
  const insertResponse = await supabase("/rest/v1/purchases", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      workspace_id: workspace.id,
      provider: "paytr",
      external_payment_id: merchantOid,
      credits: plan.credits,
      amount_minor: plan.amount,
      currency: "TRY",
      status: "pending",
    }),
  });
  if (!insertResponse.ok) return json({ error: "Could not create purchase order" }, 500);

  const userIp = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  if (!userIp) return json({ error: "Could not determine client IP" }, 400);
  const basket = btoa(unescape(encodeURIComponent(JSON.stringify([[plan.name + " Credits", (plan.amount / 100).toFixed(2), 1]]))));
  const paymentAmount = String(plan.amount);
  const noInstallment = "0";
  const maxInstallment = "0";
  const currency = "TL";
  const testMode = env("PAYTR_TEST_MODE") === "0" ? "0" : "1";
  const hashStr = env("PAYTR_MERCHANT_ID") + userIp + merchantOid + user.email + paymentAmount + basket + noInstallment + maxInstallment + currency + testMode;
  const paytrToken = await hmacBase64(env("PAYTR_MERCHANT_KEY") + env("PAYTR_MERCHANT_SALT"), hashStr);

  const form = new URLSearchParams({
    merchant_id: env("PAYTR_MERCHANT_ID"),
    user_ip: userIp,
    merchant_oid: merchantOid,
    email: user.email,
    payment_amount: paymentAmount,
    paytr_token: paytrToken,
    user_basket: basket,
    debug_on: env("PAYTR_TEST_MODE") === "0" ? "0" : "1",
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: String(user.user_metadata?.full_name ?? user.email),
    user_address: "YKI AI digital credits",
    user_phone: userPhone,
    merchant_ok_url: "https://ykiai.com.tr/credits?payment=return",
    merchant_fail_url: "https://ykiai.com.tr/credits?payment=failed",
    timeout_limit: "30",
    currency,
    test_mode: testMode,
    lang: "tr",
  });

  const tokenResponse = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const tokenData = await tokenResponse.json().catch(() => null);
  if (!tokenResponse.ok || tokenData?.status !== "success" || !tokenData?.token) {
    await supabase("/rest/v1/purchases?external_payment_id=eq." + encodeURIComponent(merchantOid), {
      method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: "failed" }),
    });
    return json({ error: "PayTR could not start the payment. Check merchant setup." }, 502);
  }

  return json({ paymentUrl: "https://www.paytr.com/odeme/guvenli/" + encodeURIComponent(tokenData.token), merchantOid });
});
