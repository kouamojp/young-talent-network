import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { access_token, user_id } = await req.json();
    if (!access_token || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing access_token or user_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify token by calling VK API
    const vkRes = await fetch(
      `https://api.vk.com/method/users.get?user_ids=${user_id}&fields=photo_200,screen_name&access_token=${access_token}&v=5.199`,
    );
    const vkJson = await vkRes.json();
    if (vkJson.error || !vkJson.response?.[0] || String(vkJson.response[0].id) !== String(user_id)) {
      return new Response(JSON.stringify({ error: 'Invalid VK token', details: vkJson.error }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const vkUser = vkJson.response[0];
    const name = `${vkUser.first_name ?? ''} ${vkUser.last_name ?? ''}`.trim() || `VK User ${user_id}`;
    const avatar = vkUser.photo_200 ?? null;
    const email = `vk_${user_id}@vk.lovable.local`;

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Find existing user by email
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    let userRow = list?.users?.find((u) => u.email === email);

    if (!userRow) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          name,
          avatar_url: avatar,
          user_type: 'talent',
          vk_id: user_id,
          provider: 'vk',
        },
      });
      if (createErr) throw createErr;
      userRow = created.user;
    }

    // Generate magic link the client will verify
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    if (linkErr) throw linkErr;

    return new Response(
      JSON.stringify({
        email,
        token_hash: linkData.properties?.hashed_token,
        user_id: userRow!.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('vk-auth error', err);
    return new Response(JSON.stringify({ error: err.message ?? String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
