import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function extractMeta(html: string, prop: string): string | null {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i');
  const m2 = html.match(re2);
  return m2 ? m2[1] : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || !/^https?:\/\//i.test(url)) {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 YAT-Bot' } });
    const html = await res.text();
    const head = html.slice(0, 100000);

    const title = extractMeta(head, 'og:title') || extractMeta(head, 'twitter:title') || (head.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? '');
    const description = extractMeta(head, 'og:description') || extractMeta(head, 'twitter:description') || extractMeta(head, 'description') || '';
    let image = extractMeta(head, 'og:image') || extractMeta(head, 'twitter:image') || null;
    const siteName = extractMeta(head, 'og:site_name') || new URL(url).hostname;

    if (image && image.startsWith('//')) image = 'https:' + image;
    if (image && image.startsWith('/')) image = new URL(image, url).toString();

    let summary = description;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (LOVABLE_API_KEY && (title || description)) {
      try {
        const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You write engaging short social posts (max 3 lines, friendly tone, 1-2 relevant emojis, no hashtags spam). Detect the language of the title/description and respond in the same language.' },
              { role: 'user', content: `Title: ${title}\nDescription: ${description}\nSource: ${siteName}\n\nWrite a catchy post summarizing this link.` }
            ],
          }),
        });
        if (aiRes.ok) {
          const data = await aiRes.json();
          summary = data.choices?.[0]?.message?.content?.trim() || description;
        }
      } catch (_) { /* fallback to description */ }
    }

    const content = `${summary}\n\n🔗 ${url}`;

    return new Response(JSON.stringify({ title, description, image, siteName, summary, content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('post-from-link error:', e);
    return new Response(JSON.stringify({ error: e.message || 'Failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
