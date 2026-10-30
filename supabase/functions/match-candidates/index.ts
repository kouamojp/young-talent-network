import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { aiCompleteJson, aiErrorResponse } from "../_shared/ai.ts";

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

    const parsed: any = await aiCompleteJson({
      messages: [
        { role: 'system', content: 'You are a recruitment matching expert. Always reply with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      // Jusqu'à 20 candidats classés, chacun avec une justification.
      maxTokens: 3000,
    }, { matches: [] });

    const byId = new Map(candidates.map((c: any) => [c.id, c]));
    const enriched = (parsed.matches || []).slice(0, 20).map((m: any) => ({
      ...m,
      profile: byId.get(m.id) || null,
    })).filter((m: any) => m.profile);

    return new Response(JSON.stringify({ matches: enriched }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('match-candidates error:', e);
    return aiErrorResponse(e, corsHeaders);
  }
});
