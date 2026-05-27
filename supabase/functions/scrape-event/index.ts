import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function meta(html: string, prop: string): string | null {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i');
  return html.match(re2)?.[1] ?? null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    let { url } = await req.json();
    if (typeof url !== 'string' || !url.trim()) {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try { new URL(url); } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 YAT-Bot' } });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch (${res.status})` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const html = await res.text();
    const head = html.slice(0, 200000);

    const title = meta(head, 'og:title') || head.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '';
    const description = meta(head, 'og:description') || meta(head, 'description') || '';
    let image = meta(head, 'og:image') || meta(head, 'twitter:image') || null;
    if (image?.startsWith('//')) image = 'https:' + image;
    if (image?.startsWith('/')) image = new URL(image, url).toString();

    // Try JSON-LD Event
    let ld: any = null;
    const ldMatches = head.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const m of ldMatches) {
      try {
        const parsed = JSON.parse(m[1].trim());
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        for (const it of arr) {
          const t = it['@type'];
          if (t === 'Event' || (Array.isArray(t) && t.includes('Event'))) { ld = it; break; }
        }
      } catch (_) {}
      if (ld) break;
    }

    let result: any = {
      title,
      description,
      image,
      start_date: ld?.startDate || null,
      end_date: ld?.endDate || null,
      location: ld?.location?.name || ld?.location?.address?.streetAddress || null,
      price: ld?.offers?.price || null,
      currency: ld?.offers?.priceCurrency || null,
    };

    // AI fallback / enrichment
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (LOVABLE_API_KEY) {
      try {
        const text = head.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 8000);
        const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'Extract event info as STRICT JSON only: {"title":"","description":"","start_date":"ISO8601 or null","end_date":"ISO8601 or null","location":"","price":"","currency":"","is_virtual":false}. Respond in the same language as the source. No markdown.' },
              { role: 'user', content: `URL: ${url}\nOG title: ${title}\nOG desc: ${description}\nPage text: ${text}` }
            ],
          }),
        });
        if (aiRes.ok) {
          const data = await aiRes.json();
          let raw = data.choices?.[0]?.message?.content?.trim() || '';
          raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/, '').trim();
          const ai = JSON.parse(raw);
          result = {
            title: ai.title || result.title,
            description: ai.description || result.description,
            image: result.image,
            start_date: result.start_date || ai.start_date || null,
            end_date: result.end_date || ai.end_date || null,
            location: result.location || ai.location || null,
            price: result.price || ai.price || null,
            currency: result.currency || ai.currency || null,
            is_virtual: ai.is_virtual ?? false,
          };
        }
      } catch (e) { console.error('AI enrich failed', e); }
    }

    result.source_url = url;
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('scrape-event error:', e);
    return new Response(JSON.stringify({ error: e.message || 'Failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
