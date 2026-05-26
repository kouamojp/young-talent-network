import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const u = createClient(supabaseUrl, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await u.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const admin = createClient(supabaseUrl, service);
    const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single();
    const { data: jobs } = await admin.from('job_postings').select('id, title, description, location, job_type, requirements, salary_range').eq('status', 'open').limit(100);

    if (!jobs?.length) {
      return new Response(JSON.stringify({ suggestions: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing');

    const prompt = `TALENT PROFILE:
Name: ${profile?.name}
Type: ${profile?.user_type}
Sport: ${profile?.sport_type || '-'}
Location: ${[profile?.city, profile?.country].filter(Boolean).join(', ') || profile?.location || '-'}
Bio: ${profile?.bio || '-'}

OPEN JOBS (id | title | location | type | requirements):
${jobs.map((j: any) => `${j.id} | ${j.title} | ${j.location || '-'} | ${j.job_type || '-'} | ${(j.requirements || []).join?.(', ') || ''}`).join('\n')}

Return JSON: {"suggestions":[{"id":"uuid","score":0-100,"reason":"why it fits"}]}
Pick the top 10 best-matching jobs for this talent and rank them.`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a career matching expert. Reply with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'Credits exhausted' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      throw new Error('AI gateway error');
    }

    const data = await aiRes.json();
    let raw = data.choices?.[0]?.message?.content || '{"suggestions":[]}';
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let parsed: any = { suggestions: [] };
    try { parsed = JSON.parse(raw); } catch { /* */ }

    const byId = new Map(jobs.map((j: any) => [j.id, j]));
    const enriched = (parsed.suggestions || []).slice(0, 10).map((s: any) => ({
      ...s,
      job: byId.get(s.id) || null,
    })).filter((s: any) => s.job);

    return new Response(JSON.stringify({ suggestions: enriched }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('suggest-jobs error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
