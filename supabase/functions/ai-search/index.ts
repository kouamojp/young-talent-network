import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { aiCompleteJson, aiErrorResponse } from "../_shared/ai.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Authentication ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Input Validation ---
    const body = await req.json();
    const query = body?.query;
    const context = body?.context;

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query is required and must be a string" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedQuery = query.trim().slice(0, 500);
    if (trimmedQuery.length < 1) {
      return new Response(JSON.stringify({ error: "query must not be empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize context to a simple object with string values only
    let safeContext: Record<string, string> = {};
    if (context && typeof context === "object" && !Array.isArray(context)) {
      for (const [key, value] of Object.entries(context)) {
        if (typeof key === "string" && typeof value === "string" && key.length <= 50 && value.length <= 200) {
          safeContext[key] = value;
        }
      }
    }

    const systemPrompt = `You are an intelligent search assistant for a social platform. 
    Help users find relevant information, connect with other users, discover events, jobs, and learning opportunities.
    Analyze the query and provide structured, actionable results in JSON format.
    Return results in this format:
    {
      "summary": "Brief summary of findings",
      "suggestions": ["suggestion1", "suggestion2"],
      "categories": ["relevant", "categories"],
      "users": [{"name": "user", "relevance": "why relevant"}],
      "links": [{"title": "link title", "path": "/path", "description": "desc"}]
    }`;

    const parsed = await aiCompleteJson({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Search query: ${trimmedQuery}\nContext: ${JSON.stringify(safeContext)}` }
      ],
    }, { summary: "", suggestions: [], categories: [], users: [], links: [] });

    // Le client fait JSON.parse(data.result) : on renvoie une chaîne toujours valide.
    return new Response(JSON.stringify({ result: JSON.stringify(parsed) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI search error:", error);
    return aiErrorResponse(error, corsHeaders);
  }
});
