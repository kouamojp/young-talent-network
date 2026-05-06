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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Gather comprehensive user data
    const { data: profile } = await adminClient.from('profiles').select('*').eq('id', user.id).single();
    const { data: achievements } = await adminClient.from('talent_achievements').select('title, category, date').eq('user_id', user.id).limit(10);
    const { data: connections } = await adminClient.from('connections').select('connected_user_id, status').eq('user_id', user.id);
    const { data: events } = await adminClient.from('events').select('title, start_date, location, category_id').order('start_date', { ascending: true }).limit(20);
    const { data: jobs } = await adminClient.from('job_postings').select('title, location, job_type, requirements').eq('status', 'open').limit(20);
    const { data: courses } = await adminClient.from('courses').select('title, category, level').limit(10);
    const { data: communities } = await adminClient.from('communities').select('name, description, members_count').order('members_count', { ascending: false }).limit(10);

    // Platform stats
    const { count: totalUsers } = await adminClient.from('profiles').select('*', { count: 'exact', head: true });
    const { count: totalEvents } = await adminClient.from('events').select('*', { count: 'exact', head: true });
    const { count: totalOrgs } = await adminClient.from('organization_profiles').select('*', { count: 'exact', head: true });
    const { count: totalJobs } = await adminClient.from('job_postings').select('*', { count: 'exact', head: true });

    const userContext = `
USER: ${profile?.name || 'Unknown'} (${profile?.user_type || 'talent'})
Location: ${profile?.location || 'Not set'}, Sport: ${profile?.sport_type || 'Not set'}
Bio: ${profile?.bio || 'Empty'}
Achievements: ${achievements?.length || 0} recorded
Connections: ${connections?.filter(c => c.status === 'accepted').length || 0} friends

PLATFORM OVERVIEW:
- ${totalUsers || 0} registered users
- ${totalEvents || 0} events
- ${totalOrgs || 0} organizations
- ${totalJobs || 0} job postings

AVAILABLE EVENTS: ${JSON.stringify(events?.slice(0, 10) || [])}
OPEN JOBS: ${JSON.stringify(jobs?.slice(0, 10) || [])}
COURSES: ${JSON.stringify(courses || [])}
TOP COMMUNITIES: ${JSON.stringify(communities?.slice(0, 5) || [])}
`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are the YAT Platform Agent. Analyze the user's profile and platform data to generate personalized, actionable suggestions.

${userContext}

Generate a JSON response with this structure:
{
  "suggestions": [
    {
      "type": "event|job|connection|learning|profile|community",
      "title": "Short title",
      "description": "Why this is relevant to the user",
      "action_link": "/path-on-platform",
      "priority": "high|medium|low"
    }
  ],
  "platform_insights": {
    "trending": "What's trending on the platform",
    "growth": "Platform growth summary",
    "tip": "A personalized tip for this user"
  }
}

Rules:
- Generate 3-6 suggestions based on user profile match
- Prioritize relevance to user's sport/location/interests
- Include at least one profile improvement suggestion if profile is incomplete
- Be specific — reference actual events, jobs, communities from the data
- action_link should be valid platform routes: /events, /work, /learning, /communities, /karta, /profile, /yat-coin`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate personalized suggestions and platform insights for this user." }
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
    
    // Clean markdown code fences if present
    result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      parsed = { suggestions: [], platform_insights: { trending: "Unable to analyze", growth: "", tip: "" } };
    }

    // Store suggestions in DB
    if (parsed.suggestions?.length) {
      // Clear old non-acted suggestions
      await adminClient.from('agent_suggestions').delete().eq('user_id', user.id).eq('acted_on', false).eq('dismissed', false);

      const rows = parsed.suggestions.map((s: any) => ({
        user_id: user.id,
        suggestion_type: s.type || 'general',
        title: s.title,
        description: s.description,
        action_link: s.action_link,
        action_data: { priority: s.priority },
      }));
      await adminClient.from('agent_suggestions').insert(rows);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI agent error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
