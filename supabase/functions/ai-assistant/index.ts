import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Compute profile completion % from key fields
function computeProfileCompletion(p: any): number {
  if (!p) return 0;
  const fields = [
    'name', 'bio', 'avatar_url', 'cover_photo_url', 'city', 'country',
    'sport_type', 'professional_title', 'languages', 'talent_level',
    'availability', 'about_me', 'birth_date', 'phone', 'website'
  ];
  const filled = fields.filter(f => {
    const v = p[f];
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== undefined && String(v).trim() !== '';
  }).length;
  return Math.round((filled / fields.length) * 100);
}

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

    const body = await req.json();
    const { messages, mode } = body; // mode: 'chat' | 'compose-post' | 'compose-message' | 'profile-tips'

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const contextParts: string[] = [];

    // 1. Full user profile + completion + YAT level
    const { data: profile } = await adminClient.from('profiles').select('*').eq('id', user.id).single();
    const { data: userLevel } = await adminClient.from('user_levels').select('*').eq('user_id', user.id).maybeSingle();
    const completion = computeProfileCompletion(profile);

    if (profile) {
      contextParts.push(`USER PROFILE:
- Name: ${profile.name || 'N/A'}
- Type: ${profile.user_type || 'talent'}
- Title: ${profile.professional_title || 'N/A'}
- Location: ${[profile.city, profile.country].filter(Boolean).join(', ') || 'N/A'}
- Sport/Talent: ${profile.sport_type || 'N/A'}
- Level: ${profile.talent_level || 'N/A'}
- Availability: ${profile.availability || 'N/A'}
- Languages: ${(profile.languages || []).join(', ') || 'N/A'}
- Bio: ${profile.bio || 'Empty'}
- Profile completion: ${completion}%
- YAT Level: ${userLevel?.level || 1} | XP: ${userLevel?.xp_total || 0} | Coins: ${userLevel?.yat_coins || 0}
- Rating: ${profile.platform_rating || 'N/A'} (${profile.rating_count || 0} reviews)`);
    }

    // 2. Skills, achievements, experience
    const [skillsRes, achievementsRes, experiencesRes] = await Promise.all([
      adminClient.from('user_skills').select('skill_name, level').eq('user_id', user.id).limit(10),
      adminClient.from('talent_achievements').select('title, achievement_type, date').eq('user_id', user.id).limit(10),
      adminClient.from('talent_experiences').select('title, organization, start_date, end_date').eq('user_id', user.id).limit(10),
    ]);
    if (skillsRes.data?.length) contextParts.push(`SKILLS: ${skillsRes.data.map(s => `${s.skill_name} (${s.level || 'N/A'})`).join(', ')}`);
    if (achievementsRes.data?.length) contextParts.push(`ACHIEVEMENTS: ${achievementsRes.data.map(a => a.title).join(', ')}`);
    if (experiencesRes.data?.length) contextParts.push(`EXPERIENCE: ${experiencesRes.data.map(e => `${e.title} @ ${e.organization}`).join('; ')}`);

    // 3. Opportunities (jobs, events, courses, scholarships)
    const [eventsRes, jobsRes, coursesRes, orgsRes, agentsRes] = await Promise.all([
      adminClient.from('events').select('title, location, start_date').gte('start_date', new Date().toISOString()).order('start_date').limit(10),
      adminClient.from('job_postings').select('title, location, job_type').eq('status', 'open').limit(10),
      adminClient.from('courses').select('title, category, level').limit(8),
      adminClient.from('organization_profiles').select('name, sport_type, city, country').limit(10),
      adminClient.from('agent_profiles').select('display_name, specialties, city').limit(8),
    ]);

    if (eventsRes.data?.length) contextParts.push(`UPCOMING EVENTS:\n${eventsRes.data.map(e => `- ${e.title} (${e.location || 'Online'}, ${e.start_date?.slice(0,10)})`).join('\n')}`);
    if (jobsRes.data?.length) contextParts.push(`OPEN JOBS:\n${jobsRes.data.map(j => `- ${j.title} (${j.location || 'Remote'}, ${j.job_type || 'N/A'})`).join('\n')}`);
    if (coursesRes.data?.length) contextParts.push(`COURSES: ${coursesRes.data.map(c => `${c.title} [${c.level || 'all'}]`).join(', ')}`);
    if (orgsRes.data?.length) contextParts.push(`ORGANIZATIONS:\n${orgsRes.data.map(o => `- ${o.name} (${o.sport_type || 'N/A'}, ${[o.city, o.country].filter(Boolean).join(', ')})`).join('\n')}`);
    if (agentsRes.data?.length) contextParts.push(`AGENTS:\n${agentsRes.data.map(a => `- ${a.display_name} (${(a.specialties || []).join(', ') || 'general'})`).join('\n')}`);

    // 4. Network: connections + communities
    const { data: connections } = await adminClient.from('connections').select('connected_user_id').eq('user_id', user.id).eq('status', 'accepted').limit(20);
    if (connections?.length) {
      const friendIds = connections.map(c => c.connected_user_id);
      const { data: friends } = await adminClient.from('profiles').select('name, sport_type, city').in('id', friendIds).limit(10);
      if (friends?.length) contextParts.push(`YOUR CONNECTIONS (${connections.length}): ${friends.map(f => `${f.name} (${f.sport_type || 'N/A'})`).join(', ')}`);
    }

    const { data: communities } = await adminClient.from('communities').select('name, members_count').order('members_count', { ascending: false }).limit(5);
    if (communities?.length) contextParts.push(`TOP COMMUNITIES: ${communities.map(c => `${c.name} (${c.members_count})`).join(', ')}`);

    // 5. Platform stats
    const [{ count: usersCount }, { count: eventsCount }, { count: orgsCount }, { count: jobsCount }] = await Promise.all([
      adminClient.from('profiles').select('*', { count: 'exact', head: true }),
      adminClient.from('events').select('*', { count: 'exact', head: true }),
      adminClient.from('organization_profiles').select('*', { count: 'exact', head: true }),
      adminClient.from('job_postings').select('*', { count: 'exact', head: true }),
    ]);
    contextParts.push(`PLATFORM: ${usersCount || 0} members, ${eventsCount || 0} events, ${orgsCount || 0} orgs, ${jobsCount || 0} jobs`);

    const platformContext = contextParts.join('\n\n');

    // Mode-specific system prompts
    const baseRole = `You are **YAT AI Assistant** — the intelligent virtual community manager, talent advisor, networking facilitator and opportunity matcher for the YAT (Young & Talent) platform.

Your missions:
- Help users **build their professional network**, **promote their talents**, and **discover opportunities** (jobs, events, training, scholarships, sponsorships, competitions).
- Connect talents with **organizations, agents, sponsors, recruiters, and mentors**.
- Boost engagement: suggest people to follow, groups to join, events to attend, posts to interact with.
- Be **proactive** — don't wait to be asked. After answering, offer 1-2 concrete next steps with platform links.
- Always respond in the **same language as the user** (auto-detect: EN, FR, RU, ES, AR, PT, ZH).

CURRENT USER CONTEXT:
${platformContext}

Use this real data — reference specific events, jobs, orgs, agents by name. Quote profile completion %, YAT level, ratings when relevant.

Platform routes: /feed, /events, /work (jobs), /learning, /karta (map), /communities, /yat-coin, /marketplace, /profile, /shorts, /messages, /friends, /organizations, /talent-dashboard, /assistant.`;

    const modePrompts: Record<string, string> = {
      'compose-post': `You are helping the user write or improve a social post. Suggest a better title, formatting, hashtags (#Innovation #Talent #YAT and domain-specific ones), keywords, and translations. Output the polished post ready to paste.`,
      'compose-message': `You are drafting a professional outreach message for networking, recruitment, sponsorship or collaboration. Be warm, concise, specific to the recipient context the user provides. Output 1-2 ready-to-send variants.`,
      'profile-tips': `Analyze the user's profile and give a prioritized action list (top 5) to increase visibility, YAT Score and opportunity matching. Quote the current completion % and expected impact ("+X% visibility").`,
    };

    const systemPrompt = `${baseRole}\n\n${modePrompts[mode] || ''}

Rules:
- Be concise, friendly, encouraging.
- Use markdown (bold, lists, links like [Events](/events)).
- Quote actual data — never invent events, jobs or people.
- When you don't have data, say so and offer a path to find it.
- End most replies with **"💡 Prochaine étape:"** / **"💡 Next step:"** suggesting 1-2 actions.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-20).map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content).slice(0, 4000)
      }))
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: any) {
    console.error("AI assistant error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
