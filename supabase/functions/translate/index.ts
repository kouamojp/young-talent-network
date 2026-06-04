import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANG_NAMES: Record<string, string> = {
  en: 'English', fr: 'French', ru: 'Russian', es: 'Spanish',
  ar: 'Arabic', pt: 'Portuguese', zh: 'Chinese (Simplified)',
  auto: 'the user\'s detected device language',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { text, target = 'en', source = 'auto' } = await req.json();
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: "text required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const targetName = LANG_NAMES[target] || 'English';
    const sourceName = source === 'auto' ? 'auto-detect the source language' : `from ${LANG_NAMES[source] || source}`;

    const sys = `You are a professional translator. Translate the user text ${sourceName} into ${targetName}. Preserve formatting (line breaks, markdown, emojis, hashtags, URLs, @mentions). Do NOT add comments, explanations or quotation marks — return only the translated text.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: text.slice(0, 6000) },
        ],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const txt = await resp.text();
      console.error('translate failed', resp.status, txt);
      throw new Error("AI gateway error");
    }
    const json = await resp.json();
    const translated = json.choices?.[0]?.message?.content?.trim() || '';

    return new Response(JSON.stringify({ ok: true, translated, target, source }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e: any) {
    console.error('translate error', e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
