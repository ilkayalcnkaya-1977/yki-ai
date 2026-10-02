import { rpcAsSystem } from "./supabase-rest.server";
function timingSafeEqual(a: string, b: string) { if (a.length !== b.length) return false; let result = 0; for (let i=0;i<a.length;i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i); return result === 0; }
function b64(bytes: Uint8Array) { let binary = ""; bytes.forEach((byte) => { binary += String.fromCharCode(byte); }); return btoa(binary); }
async function signature(secret: string, id: string, timestamp: string, body: string) { const raw = secret.replace(/^whsec_/, ""); const key = await crypto.subtle.importKey("raw", Uint8Array.from(atob(raw), c => c.charCodeAt(0)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]); return b64(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${body}`)))); }
export async function handleReplicateWebhook(request: Request) {
 const secret=process.env.REPLICATE_WEBHOOK_SECRET; if (!secret) return new Response("Webhook is not configured", {status:503});
 const id=request.headers.get("webhook-id"), timestamp=request.headers.get("webhook-timestamp"), header=request.headers.get("webhook-signature"); const body=await request.text();
 if (!id || !timestamp || !header || Math.abs(Date.now()/1000-Number(timestamp))>300) return new Response("Invalid webhook",{status:401});
 const expected=await signature(secret,id,timestamp,body); const valid=header.split(" ").some(v=>v.startsWith("v1,") && timingSafeEqual(v.slice(3),expected)); if(!valid) return new Response("Invalid webhook",{status:401});
 const prediction=JSON.parse(body) as {id?:string;status?:string;output?:string|string[];error?:unknown}; if(!prediction.id || !prediction.status) return new Response("Invalid payload",{status:400});
 const output=Array.isArray(prediction.output)?prediction.output[0]:prediction.output ?? null;
 await rpcAsSystem("system_apply_provider_update", {p_provider_job_id:prediction.id,p_status:prediction.status,p_output_url:output,p_error_code:typeof prediction.error === "string" ? prediction.error : null,p_metadata:prediction});
 return new Response("ok",{status:200});
}
