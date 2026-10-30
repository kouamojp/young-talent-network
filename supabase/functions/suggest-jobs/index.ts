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

    const u = createClient(supabaseUrl, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await u.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const admin = createClient(supabaseUrl, service);
    const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single();
    const { data: jobs } = await admin.from('job_postings').select('id, title, description, location, job_type, requirements, salary_range').eq('status', 'open').limit(100);

    if (!jobs?.length) {
      return new Response(JSON.stringify({ suggestions: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

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

    const parsed: any = await aiCompleteJson({
      messages: [
        { role: 'system', content: 'You are a career matching expert. Reply with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
    }, { suggestions: [] });

    const byId = new Map(jobs.map((j: any) => [j.id, j]));
    const enriched = (parsed.suggestions || []).slice(0, 10).map((s: any) => ({
      ...s,
      job: byId.get(s.id) || null,
    })).filter((s: any) => s.job);

    return new Response(JSON.stringify({ suggestions: enriched }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('suggest-jobs error:', e);
    return aiErrorResponse(e, corsHeaders);
  }
});
