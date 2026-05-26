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

    const user = createClient(supabaseUrl, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user: u } } = await user.auth.getUser();
    if (!u) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { jobId, criteria } = await req.json();
    const admin = createClient(supabaseUrl, service);

    let job: any = null;
    if (jobId) {
      const { data } = await admin.from('job_postings').select('*').eq('id', jobId).single();
      job = data;
    } else if (criteria) {
      job = criteria;
    } else {
      return new Response(JSON.stringify({ error: 'jobId or criteria required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch up to 200 talent/agent candidates
    const { data: candidates } = await admin
      .from('profiles')
      .select('id, name, avatar_url, user_type, bio, sport_type, location, city, country, category_id, platform_rating')
      .in('user_type', ['talent', 'agent'])
      .limit(200);

    if (!candidates?.length) {
      return new Response(JSON.stringify({ matches: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing');

    const prompt = `JOB:
Title: ${job.title || ''}
Description: ${job.description || ''}
Location: ${job.location || ''}
Requirements: ${(job.requirements || []).join?.(', ') || job.requirements || ''}
Type: ${job.job_type || ''}

CANDIDATES (id | name | sport | location | bio | rating):
${candidates.map((c: any) => `${c.id} | ${c.name} | ${c.sport_type || '-'} | ${[c.city, c.country].filter(Boolean).join(', ') || c.location || '-'} | ${(c.bio || '').slice(0, 120)} | ${c.platform_rating || 0}`).join('\n')}

Return JSON: {"matches":[{"id":"uuid","score":0-100,"reason":"1 short sentence"}]}
Rank top 20 by relevance to the job. Higher score = better match.`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a recruitment matching expert. Always reply with valid JSON only.' },
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
    let raw = data.choices?.[0]?.message?.content || '{"matches":[]}';
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let parsed: any = { matches: [] };
    try { parsed = JSON.parse(raw); } catch { /* keep empty */ }

    const byId = new Map(candidates.map((c: any) => [c.id, c]));
    const enriched = (parsed.matches || []).slice(0, 20).map((m: any) => ({
      ...m,
      profile: byId.get(m.id) || null,
    })).filter((m: any) => m.profile);

    return new Response(JSON.stringify({ matches: enriched }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('match-candidates error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
