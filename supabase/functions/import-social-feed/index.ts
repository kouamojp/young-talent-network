// Imports recent posts from external social channels (YouTube, RSS, generic)
// into the user's feed as posts marked with external_source_url/_platform.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type FeedItem = {
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  published_at?: string;
};

function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("twitter.com") || u.includes("x.com")) return "x";
  if (u.includes("facebook.com")) return "facebook";
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.endsWith(".xml") || u.includes("/rss") || u.includes("/feed")) return "rss";
  return "web";
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; YAT-Bot/1.0)" } });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
}

function parseRss(xml: string, limit = 5): FeedItem[] {
  const items: FeedItem[] = [];
  // Atom (YouTube)
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = entryRe.exec(xml)) && items.length < limit) {
    const blk = m[1];
    const title = blk.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() || "";
    const link = blk.match(/<link[^>]*href="([^"]+)"/)?.[1] || "";
    const published = blk.match(/<published>([\s\S]*?)<\/published>/)?.[1] || "";
    const thumb = blk.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1] || "";
    const desc = blk.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1]?.trim() || "";
    if (link && title) items.push({ url: link, title, description: desc, thumbnail: thumb, published_at: published });
  }
  if (items.length) return items;
  // RSS 2.0
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  while ((m = itemRe.exec(xml)) && items.length < limit) {
    const blk = m[1];
    const title = blk.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() || "";
    const link = blk.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || "";
    const published = blk.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";
    const desc = blk.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1] || "";
    const thumb = blk.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1]
      || blk.match(/<enclosure[^>]*url="([^"]+)"/)?.[1] || "";
    if (link && title) items.push({ url: link, title, description: desc.replace(/<[^>]+>/g, "").slice(0, 500), thumbnail: thumb, published_at: published });
  }
  return items;
}

async function fetchYouTube(url: string): Promise<FeedItem[]> {
  // Try direct channel_id from URL
  let channelId = url.match(/channel\/(UC[\w-]+)/)?.[1] || null;
  if (!channelId) {
    // Fetch page and extract
    const html = await fetchText(url);
    if (html) {
      channelId = html.match(/"channelId":"(UC[\w-]+)"/)?.[1]
        || html.match(/<link rel="canonical" href="[^"]*channel\/(UC[\w-]+)/)?.[1] || null;
    }
  }
  if (!channelId) return [];
  const rss = await fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
  if (!rss) return [];
  return parseRss(rss);
}

async function fetchGenericWeb(url: string): Promise<FeedItem[]> {
  const html = await fetchText(url);
  if (!html) return [];
  const title = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1]
    || html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() || url;
  const description = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1]
    || html.match(/<meta name="description" content="([^"]+)"/)?.[1] || "";
  const thumbnail = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] || "";
  return [{ url, title, description, thumbnail, published_at: new Date().toISOString() }];
}

async function fetchFeedItems(url: string, platform: string): Promise<FeedItem[]> {
  if (platform === "youtube") return fetchYouTube(url);
  if (platform === "rss") {
    const xml = await fetchText(url);
    return xml ? parseRss(xml) : [];
  }
  // tiktok/instagram/x — public scraping is blocked; fall back to og of the main page
  return fetchGenericWeb(url);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    let body: any = {};
    try { body = await req.json(); } catch {}
    const { source_id, all_due } = body;

    let sources: any[] = [];
    if (source_id) {
      const { data } = await admin.from("profile_sources").select("*").eq("id", source_id).limit(1);
      sources = data || [];
    } else if (all_due) {
      const cutoff = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      const { data } = await admin.from("profile_sources")
        .select("*")
        .eq("auto_import_posts", true)
        .or(`last_import_at.is.null,last_import_at.lt.${cutoff}`)
        .limit(50);
      sources = data || [];
    } else {
      return new Response(JSON.stringify({ error: "source_id or all_due required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let totalImported = 0;
    const results: any[] = [];

    for (const src of sources) {
      const platform = src.platform || detectPlatform(src.url);
      const items = await fetchFeedItems(src.url, platform);
      let imported = 0;

      for (const item of items) {
        // Dedupe by (user_id, external_source_url)
        const { data: existing } = await admin
          .from("posts")
          .select("id")
          .eq("user_id", src.user_id)
          .eq("external_source_url", item.url)
          .limit(1)
          .maybeSingle();
        if (existing) continue;

        const content = [item.title, item.description, `\n🔗 ${item.url}`].filter(Boolean).join("\n\n");
        const { error } = await admin.from("posts").insert({
          user_id: src.user_id,
          content,
          media_urls: item.thumbnail ? [item.thumbnail] : null,
          visibility: "public",
          is_published: true,
          status: "published",
          external_source_url: item.url,
          external_source_platform: platform,
        });
        if (!error) imported++;
      }

      await admin.from("profile_sources")
        .update({ last_import_at: new Date().toISOString(), platform })
        .eq("id", src.id);

      totalImported += imported;
      results.push({ source_id: src.id, platform, found: items.length, imported });
    }

    return new Response(JSON.stringify({ success: true, total_imported: totalImported, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
