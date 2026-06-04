import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function computeProfileCompletion(p: any): number {
  if (!p) return 0;
  const fields = ['name','bio','avatar_url','cover_photo_url','city','country','sport_type','professional_title','languages','talent_level','availability','about_me','birth_date','phone','website'];
  const filled = fields.filter(f => {
    const v = p[f];
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== undefined && String(v).trim() !== '';
  }).length;
  return Math.round((filled / fields.length) * 100);
}

function computeYatScore(p: any, completion: number, skills: number, achievements: number, experiences: number, connections: number, level: number, rating: number): number {
  // Weighted score out of 100
  const w = {
    completion: completion * 0.25,
    skills: Math.min(skills * 3, 15),
    achievements: Math.min(achievements * 4, 20),
    experiences: Math.min(experiences * 3, 12),
    connections: Math.min(connections * 0.5, 10),
    level: Math.min(level * 1.5, 10),
    rating: rating * 1.6, // out of 5 → 8
  };
  return Math.round(Object.values(w).reduce((a, b) => a + b, 0));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile } = await adminClient.from('profiles').select('*').eq('id', user.id).single();
    const { data: userLevel } = await adminClient.from('user_levels').select('*').eq('user_id', user.id).maybeSingle();
    const [skillsRes, achievementsRes, experiencesRes, connRes] = await Promise.all([
      adminClient.from('user_skills').select('skill_name, level').eq('user_id', user.id),
      adminClient.from('talent_achievements').select('title, achievement_type').eq('user_id', user.id),
      adminClient.from('talent_experiences').select('title, organization').eq('user_id', user.id),
      adminClient.from('connections').select('connected_user_id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'accepted'),
    ]);

    const completion = computeProfileCompletion(profile);
    const yatScore = computeYatScore(
      profile, completion,
      skillsRes.data?.length || 0,
      achievementsRes.data?.length || 0,
      experiencesRes.data?.length || 0,
      connRes.count || 0,
      userLevel?.level || 1,
      Number(profile?.platform_rating) || 0
    );

    const [eventsRes, jobsRes, coursesRes, orgsRes, agentsRes, communitiesRes] = await Promise.all([
      adminClient.from('events').select('title, location, start_date, category_id').gte('start_date', new Date().toISOString()).order('start_date').limit(15),
      adminClient.from('job_postings').select('title, location, job_type, requirements').eq('status', 'open').limit(15),
      adminClient.from('courses').select('title, category, level').limit(10),
      adminClient.from('organization_profiles').select('name, sport_type, city, country').limit(15),
      adminClient.from('agent_profiles').select('display_name, specialties').limit(10),
      adminClient.from('communities').select('name, description, members_count').order('members_count', { ascending: false }).limit(10),
    ]);

    const { count: totalUsers } = await adminClient.from('profiles').select('*', { count: 'exact', head: true });
    const { count: totalOrgs } = await adminClient.from('organization_profiles').select('*', { count: 'exact', head: true });

    const userContext = `
USER: ${profile?.name || 'Unknown'} (${profile?.user_type || 'talent'})
Title: ${profile?.professional_title || 'N/A'} | Location: ${[profile?.city, profile?.country].filter(Boolean).join(', ') || 'N/A'}
Sport/Talent: ${profile?.sport_type || 'N/A'} | Level: ${profile?.talent_level || 'N/A'} | Availability: ${profile?.availability || 'N/A'}
Languages: ${(profile?.languages || []).join(', ') || 'N/A'}
Profile completion: ${completion}% | YAT Score: ${yatScore}/100 | YAT Level: ${userLevel?.level || 1} | Rating: ${profile?.platform_rating || 'N/A'}
Skills: ${skillsRes.data?.length || 0} | Achievements: ${achievementsRes.data?.length || 0} | Experience: ${experiencesRes.data?.length || 0} | Connections: ${connRes.count || 0}
Top skills: ${(skillsRes.data || []).slice(0,5).map((s: any) => s.skill_name).join(', ')}

PLATFORM: ${totalUsers || 0} users, ${totalOrgs || 0} orgs

AVAILABLE EVENTS: ${JSON.stringify(eventsRes.data?.slice(0, 8) || [])}
OPEN JOBS: ${JSON.stringify(jobsRes.data?.slice(0, 8) || [])}
COURSES: ${JSON.stringify(coursesRes.data || [])}
ORGANIZATIONS: ${JSON.stringify(orgsRes.data?.slice(0, 8) || [])}
AGENTS: ${JSON.stringify(agentsRes.data || [])}
COMMUNITIES: ${JSON.stringify(communitiesRes.data?.slice(0, 5) || [])}
`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are the **YAT AI Agent** — proactive talent advisor & networking facilitator.

Generate hyper-personalized, actionable suggestions for this user. Each suggestion must reference REAL data from the context.

${userContext}

Output STRICT JSON (no markdown fences):
{
  "yat_score": ${yatScore},
  "profile_completion": ${completion},
  "suggestions": [
    {
      "type": "event|job|connection|organization|agent|mentor|sponsor|recruiter|learning|profile|community|opportunity",
      "title": "Short title (max 60 chars)",
      "description": "Why relevant + concrete benefit (max 140 chars)",
      "action_link": "/events|/work|/karta|/communities|/profile|/yat-coin|/learning|/organizations|/friends",
      "priority": "high|medium|low",
      "match_score": 0-100
    }
  ],
  "platform_insights": {
    "trending": "What's trending now (1 sentence, reference real items)",
    "growth": "Platform growth highlight",
    "tip": "Personalized profile/visibility tip for THIS user"
  },
  "score_breakdown": {
    "strengths": ["short bullet", "short bullet"],
    "improvements": ["short actionable", "short actionable"]
  }
}

Rules:
- Generate 5-8 suggestions, prioritized by match_score (highest first)
- Cover diverse types: at least 1 job/opportunity, 1 connection/org/agent, 1 event, 1 profile improvement
- If profile_completion < 80%, include a "profile" suggestion in top 3
- match_score = compatibility % based on sport_type, location, level, languages, skills
- Reference SPECIFIC events/jobs/orgs by name from the data
- Respond in the user's language (default FR if unclear)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate personalized suggestions, YAT score breakdown and platform insights now." }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let result = data.choices?.[0]?.message?.content || "{}";
    result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsed: any;
    try { parsed = JSON.parse(result); } catch {
      parsed = { suggestions: [], platform_insights: { trending: "", growth: "", tip: "" }, yat_score: yatScore, profile_completion: completion };
    }
    parsed.yat_score = parsed.yat_score ?? yatScore;
    parsed.profile_completion = parsed.profile_completion ?? completion;

    if (parsed.suggestions?.length) {
      await adminClient.from('agent_suggestions').delete().eq('user_id', user.id).eq('acted_on', false).eq('dismissed', false);
      const rows = parsed.suggestions.map((s: any) => ({
        user_id: user.id,
        suggestion_type: s.type || 'general',
        title: s.title,
        description: s.description,
        action_link: s.action_link,
        action_data: { priority: s.priority, match_score: s.match_score },
      }));
      await adminClient.from('agent_suggestions').insert(rows);
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("AI agent error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
