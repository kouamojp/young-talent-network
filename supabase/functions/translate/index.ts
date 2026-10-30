import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiComplete, aiErrorResponse, isAIConfigured } from "../_shared/ai.ts";

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
    if (!isAIConfigured()) {
      return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { text, target = 'en', source = 'auto' } = await req.json();
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: "text required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const targetName = LANG_NAMES[target] || 'English';
    const sourceName = source === 'auto' ? 'auto-detect the source language' : `from ${LANG_NAMES[source] || source}`;

    const sys = `You are a professional translator. Translate the user text ${sourceName} into ${targetName}. Preserve formatting (line breaks, markdown, emojis, hashtags, URLs, @mentions). Do NOT add comments, explanations or quotation marks — return only the translated text.`;

    const translated = await aiComplete({
      tier: 'fast',
      messages: [
        { role: "system", content: sys },
        { role: "user", content: text.slice(0, 6000) },
      ],
      // Une traduction peut être plus longue que la source : on garde de la marge.
      maxTokens: 4000,
      temperature: 0.2,
    });

    return new Response(JSON.stringify({ ok: true, translated, target, source }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e: any) {
    console.error('translate error', e);
    return aiErrorResponse(e, corsHeaders);
  }
});
