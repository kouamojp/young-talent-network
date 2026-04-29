import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const catList = (cats || [])
      .map((c) => `- ${c.slug}: ${c.name_en} / ${c.name_fr} / ${c.name_ru}`)
      .join("\n");

    const sys = `You match user descriptions to YAT category slugs. Return ONLY a JSON object: {"slugs":["slug1","slug2","slug3"]} with up to 3 BEST matching slugs from this list:\n${catList}\nUse only listed slugs. If nothing matches well, return {"slugs":[]}.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: text.slice(0, 500) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("AI gateway error", r.status, errText);
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    let slugs: string[] = [];
    try {
      const parsed = JSON.parse(content);
      slugs = Array.isArray(parsed.slugs) ? parsed.slugs.slice(0, 3) : [];
    } catch {
      slugs = [];
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
