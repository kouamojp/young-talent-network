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

    // Auth check
    const userClient = createClient(supabaseUrl, supabaseAnon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { messages, conversation_id } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const lastMessage = messages[messages.length - 1]?.content?.trim().slice(0, 2000) || "";

    // Query internal data for context
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Gather platform context based on user query
    const contextParts: string[] = [];

    // User's own profile
    const { data: profile } = await adminClient.from('profiles').select('*').eq('id', user.id).single();
    if (profile) {
      contextParts.push(`USER PROFILE: Name: ${profile.name}, Type: ${profile.user_type}, Location: ${profile.location || 'N/A'}, Bio: ${profile.bio || 'N/A'}, Sport: ${profile.sport_type || 'N/A'}`);
    }

    // Recent events
    const { data: events } = await adminClient.from('events').select('title, location, start_date, description').order('start_date', { ascending: true }).limit(10);
    if (events?.length) {
      contextParts.push(`UPCOMING EVENTS:\n${events.map(e => `- ${e.title} (${e.location || 'Online'}, ${e.start_date})`).join('\n')}`);
    }

    // Recent job postings
    const { data: jobs } = await adminClient.from('job_postings').select('title, location, job_type, salary_range').eq('status', 'open').limit(10);
    if (jobs?.length) {
      contextParts.push(`OPEN JOBS:\n${jobs.map(j => `- ${j.title} (${j.location || 'Remote'}, ${j.job_type || 'N/A'})`).join('\n')}`);
    }

    // Platform stats
    const { count: usersCount } = await adminClient.from('profiles').select('*', { count: 'exact', head: true });
    const { count: eventsCount } = await adminClient.from('events').select('*', { count: 'exact', head: true });
    const { count: orgsCount } = await adminClient.from('organization_profiles').select('*', { count: 'exact', head: true });
    contextParts.push(`PLATFORM STATS: ${usersCount || 0} users, ${eventsCount || 0} events, ${orgsCount || 0} organizations`);

    // User's connections
    const { data: connections } = await adminClient.from('connections').select('connected_user_id, status').eq('user_id', user.id).eq('status', 'accepted').limit(5);
    if (connections?.length) {
      const friendIds = connections.map(c => c.connected_user_id);
      const { data: friends } = await adminClient.from('profiles').select('name, sport_type').in('id', friendIds);
      if (friends?.length) {
        contextParts.push(`YOUR FRIENDS: ${friends.map(f => f.name).join(', ')}`);
      }
    }

    // Communities
    const { data: communities } = await adminClient.from('communities').select('name, members_count').order('members_count', { ascending: false }).limit(5);
    if (communities?.length) {
      contextParts.push(`TOP COMMUNITIES: ${communities.map(c => `${c.name} (${c.members_count} members)`).join(', ')}`);
    }

    const platformContext = contextParts.join('\n\n');

    const systemPrompt = `You are YAT Assistant — the intelligent AI assistant for the YAT (Young Active Talent) platform. You help users navigate the platform, find opportunities, connect with other talents, and get the most out of YAT.

PLATFORM DATA (use this to answer questions):
${platformContext}

CAPABILITIES:
- Answer questions about the platform, its features, events, jobs, users
- Help users find relevant connections, events, communities
- Provide career advice and talent development tips
- Explain how platform features work (YAT Coin, YAT Karta, marketplace, etc.)
- Search the web for additional context when internal data is insufficient

RULES:
- Always prioritize internal platform data
- Be friendly, encouraging, and professional
- Respond in the same language as the user
- When suggesting actions, provide specific platform links like /events, /work, /karta
- If you don't have enough data, say so honestly
- Keep responses concise but helpful`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-20).map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content).slice(0, 2000)
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
  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
