// Scheduled function: re-syncs profile_sources flagged with auto_sync=true,
// where last_synced_at is older than 24h (or never synced).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey);

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: sources } = await admin
      .from("profile_sources")
      .select("id, user_id, url")
      .eq("auto_sync", true)
      .or(`last_synced_at.is.null,last_synced_at.lt.${cutoff}`)
      .limit(50);

    if (!sources?.length) {
      return new Response(JSON.stringify({ success: true, processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark them syncing
    const ids = sources.map((s: any) => s.id);
    await admin.from("profile_sources").update({ status: "syncing" }).in("id", ids);

    let ok = 0, err = 0;
    // Call scrape-profile sequentially (avoid rate-limit bursts)
    for (const s of sources) {
      try {
        // Inline scrape: fetch URL + AI extract (simplified — mirrors scrape-profile)
        const pageRes = await fetch(s.url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; YAT-Bot/1.0)" } }).catch(() => null);
        if (!pageRes || !pageRes.ok) {
          await admin.from("profile_sources").update({ status: "error", error_message: `Fetch ${pageRes?.status || 'failed'}` }).eq("id", s.id);
          err++; continue;
        }
        const html = await pageRes.text();
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 6000);

        const lovableKey = Deno.env.get("LOVABLE_API_KEY");
        let extracted: any = { raw_text: text.slice(0, 1500) };
        if (lovableKey) {
          const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${lovableKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: `Extract profile data. Return JSON: {name, bio, location, sport_or_specialty, achievements:[{title,date}], stats, skills:[], photos:[], social_links:[{platform,url}]}` },
                { role: "user", content: `URL: ${s.url}\n\n${text}` },
              ],
              response_format: { type: "json_object" },
            }),
          });
          if (ai.ok) {
            const j = await ai.json();
            try { extracted = JSON.parse(j.choices?.[0]?.message?.content || "{}"); } catch {}
          }
        }
        await admin.from("profile_sources").update({
          status: "synced",
          last_synced_at: new Date().toISOString(),
          extracted_data: extracted,
          error_message: null,
        }).eq("id", s.id);
        ok++;
      } catch (e: any) {
        await admin.from("profile_sources").update({ status: "error", error_message: e?.message || "Unknown" }).eq("id", s.id);
        err++;
      }
    }

    return new Response(JSON.stringify({ success: true, processed: sources.length, ok, err }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
