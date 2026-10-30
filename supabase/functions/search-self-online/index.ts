import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { aiCompleteJson, aiErrorResponse, isAIConfigured } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { query, name, city, sport } = await req.json();
    if (!isAIConfigured()) return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userInfo = [name, city, sport, query].filter(Boolean).join(", ");

    const parsed = await aiCompleteJson<{ suggestions?: unknown[] }>({
      messages: [
        {
          role: "system",
          content: `You help users find their existing online presence. Given a person's info, suggest 10 likely PUBLIC profile URLs on major platforms (LinkedIn, Instagram, Twitter/X, Facebook, YouTube, TikTok, GitHub, sports DBs, Wikipedia, personal site guesses). Return ONLY JSON: {"suggestions":[{"platform":"...","url":"https://...","label":"...","confidence":"high|medium|low","reason":"..."}]}. Use realistic URL patterns based on the name. Never invent fake-looking handles — derive from the actual name provided.`,
        },
        { role: "user", content: `Find profiles for: ${userInfo}` },
      ],
    }, { suggestions: [] });

    return new Response(JSON.stringify({ success: true, suggestions: parsed.suggestions || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return aiErrorResponse(e, corsHeaders);
  }
});
