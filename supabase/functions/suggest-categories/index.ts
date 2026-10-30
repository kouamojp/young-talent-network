import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { aiCompleteJson } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 3) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: cats } = await supabase
      .from("yat_categories")
      .select("id, slug, name_en, name_fr, name_ru")
      .order("sort_order");

    const catList = (cats || [])
      .map((c) => `- ${c.slug}: ${c.name_en} / ${c.name_fr} / ${c.name_ru}`)
      .join("\n");

    const sys = `You match user descriptions to YAT category slugs. Return ONLY a JSON object: {"slugs":["slug1","slug2","slug3"]} with up to 3 BEST matching slugs from this list:\n${catList}\nUse only listed slugs. If nothing matches well, return {"slugs":[]}.`;

    // Suggestion d'assistance à la saisie : une panne IA ne doit jamais bloquer
    // le formulaire, on retombe sur une liste vide.
    let slugs: string[] = [];
    try {
      const parsed = await aiCompleteJson<{ slugs?: string[] }>({
        tier: "fast",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: text.slice(0, 500) },
        ],
        maxTokens: 200,
      }, { slugs: [] });
      slugs = Array.isArray(parsed.slugs) ? parsed.slugs.slice(0, 3) : [];
    } catch (aiErr) {
      console.error("suggest-categories AI unavailable", aiErr);
    }

    const idMap = new Map((cats || []).map((c: any) => [c.slug, c.id]));
    const suggestions = slugs.map((s) => idMap.get(s)).filter(Boolean);
    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-categories error", e);
    return new Response(JSON.stringify({ suggestions: [], error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
