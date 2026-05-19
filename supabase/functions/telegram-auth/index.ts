import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

async function hmacSha256Hex(keyBytes: Uint8Array, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Bytes(input: string): Promise<Uint8Array> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return new Uint8Array(d);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const BOT_USERNAME = Deno.env.get('TELEGRAM_BOT_USERNAME');
  if (!BOT_TOKEN || !BOT_USERNAME) return json({ error: 'Telegram bot not configured' }, 500);

  if (req.method === 'GET') {
    return json({ bot_username: BOT_USERNAME });
  }

  try {
    const payload = await req.json();
    const { hash, ...fields } = payload ?? {};
    if (!hash || !fields.id) return json({ error: 'Invalid payload' }, 400);

    // Verify Telegram signature
    const dataCheckString = Object.keys(fields)
      .sort()
      .map((k) => `${k}=${fields[k]}`)
      .join('\n');
    const secretKey = await sha256Bytes(BOT_TOKEN);
    const computed = await hmacSha256Hex(secretKey, dataCheckString);
    if (computed !== hash) return json({ error: 'Bad Telegram signature' }, 401);

    // auth_date freshness (within 1 day)
    if (Math.floor(Date.now() / 1000) - Number(fields.auth_date) > 86400) {
      return json({ error: 'Auth data outdated' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const tgId = String(fields.id);
    const email = `tg_${tgId}@telegram.yat.local`;
    const name = [fields.first_name, fields.last_name].filter(Boolean).join(' ').trim() || fields.username || `tg_${tgId}`;

    // Find existing
    const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    let user = list?.users?.find((u: any) => u.email === email);

    if (!user) {
      const { data: created, error: cErr } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          name,
          user_type: 'talent',
          telegram_id: tgId,
          telegram_username: fields.username ?? null,
          avatar_url: fields.photo_url ?? null,
          provider: 'telegram',
        },
      });
      if (cErr) return json({ error: cErr.message }, 500);
      user = created.user;
    }

    // Generate magic link to deliver a verifiable token_hash to client
    const { data: link, error: lErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    if (lErr) return json({ error: lErr.message }, 500);

    const token_hash =
      (link as any)?.properties?.hashed_token ??
      (link as any)?.properties?.token_hash;

    if (!token_hash) return json({ error: 'Failed to generate token' }, 500);

    return json({ email, token_hash, user_id: user!.id });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
