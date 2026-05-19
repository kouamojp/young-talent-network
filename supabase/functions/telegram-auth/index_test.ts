// Deno tests for telegram-auth edge function
// Run with: deno test --allow-net --allow-env
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");

const FN_URL = `${SUPABASE_URL}/functions/v1/telegram-auth`;

async function sha256Bytes(input: string): Promise<Uint8Array> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return new Uint8Array(d);
}
async function hmacHex(key: Uint8Array, msg: string): Promise<string> {
  const k = await crypto.subtle.importKey("raw", key as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg) as BufferSource);
  return Array.from(new Uint8Array(s)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function buildTgPayload(fields: Record<string, any>, tokenOverride?: string) {
  const token = tokenOverride ?? BOT_TOKEN!;
  const ordered = Object.keys(fields).sort().map(k => `${k}=${fields[k]}`).join("\n");
  const secret = await sha256Bytes(token);
  const hash = await hmacHex(secret, ordered);
  return { ...fields, hash };
}

async function post(body: unknown) {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null; try { json = JSON.parse(text); } catch { /* */ }
  return { status: res.status, body: json ?? text };
}

Deno.test("GET returns bot_username", async () => {
  const res = await fetch(FN_URL, { method: "GET", headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } });
  const json = await res.json();
  assertEquals(res.status, 200);
  if (!json.bot_username) throw new Error("missing bot_username: " + JSON.stringify(json));
});

Deno.test("rejects missing hash/id", async () => {
  const r = await post({ id: 123 });
  assertEquals(r.status, 400);
});

Deno.test("rejects bad signature", async () => {
  if (!BOT_TOKEN) { console.warn("skip: no BOT_TOKEN"); return; }
  const payload = await buildTgPayload({
    id: 999999001, first_name: "Bad", username: "bad", auth_date: Math.floor(Date.now() / 1000),
  }, "wrong-token");
  const r = await post(payload);
  assertEquals(r.status, 401);
  assertEquals(r.body.error, "Bad Telegram signature");
});

Deno.test("rejects outdated auth_date", async () => {
  if (!BOT_TOKEN) { console.warn("skip: no BOT_TOKEN"); return; }
  const payload = await buildTgPayload({
    id: 999999002, first_name: "Old", username: "old",
    auth_date: Math.floor(Date.now() / 1000) - 90000, // > 1 day
  });
  const r = await post(payload);
  assertEquals(r.status, 401);
  assertEquals(r.body.error, "Auth data outdated");
});

Deno.test("creates user on first valid login & returns token_hash", async () => {
  if (!BOT_TOKEN) { console.warn("skip: no BOT_TOKEN"); return; }
  const tgId = 990000000 + Math.floor(Math.random() * 9999);
  const payload = await buildTgPayload({
    id: tgId, first_name: "Test", last_name: "User", username: `tu_${tgId}`,
    auth_date: Math.floor(Date.now() / 1000),
  });
  const r = await post(payload);
  assertEquals(r.status, 200);
  if (!r.body.token_hash || !r.body.user_id) throw new Error("missing fields: " + JSON.stringify(r.body));
  assertEquals(r.body.email, `tg_${tgId}@telegram.yat.local`);

  // Second call → should find existing user (same email, new token_hash)
  const payload2 = await buildTgPayload({
    id: tgId, first_name: "Test", last_name: "User", username: `tu_${tgId}`,
    auth_date: Math.floor(Date.now() / 1000),
  });
  const r2 = await post(payload2);
  assertEquals(r2.status, 200);
  assertEquals(r2.body.user_id, r.body.user_id);
});
