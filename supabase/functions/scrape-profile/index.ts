import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";
import { isAIConfigured } from "../_shared/ai.ts";
import { extractProfileData } from "../_shared/profileExtraction.ts";
import { fetchPublicPage, UnsafeUrlError } from "../_shared/safeFetch.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { source_id } = await req.json();
    if (!source_id) {
      return new Response(JSON.stringify({ error: "source_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Fetch the source
    const { data: source, error: sourceError } = await adminClient
      .from("profile_sources")
      .select("*")
      .eq("id", source_id)
      .eq("user_id", user.id)
      .single();

    if (sourceError || !source) {
      return new Response(JSON.stringify({ error: "Source not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status to syncing
    await adminClient
      .from("profile_sources")
      .update({ status: "syncing" })
      .eq("id", source_id);

    try {
      // Fetch the URL content. Only public http(s) addresses are allowed, and every
      // redirect is re-checked: the URL comes from the user (see _shared/safeFetch.ts).
      const pageResponse = await fetchPublicPage(source.url);

      if (!pageResponse.ok) {
        const msg = `Failed to fetch URL: ${pageResponse.status}`;
        await adminClient
          .from("profile_sources")
          .update({ status: "error", error_message: msg })
          .eq("id", source_id);
        return new Response(
          JSON.stringify({ error: msg, fallback: true, status: pageResponse.status }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const html = pageResponse.text;
      // Extract text content (strip tags)
      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 8000);

      // Use AI to extract profile data
      let extractedData: Record<string, unknown> = {};

      // L'IA n'est qu'un enrichissement : une panne ne doit pas faire échouer
      // la synchronisation, on retombe sur le texte brut de la page.
      if (isAIConfigured()) {
        try {
          extractedData = await extractProfileData(textContent, "webpage", source.url);
          if (Object.keys(extractedData).length === 0) extractedData = { raw_text: textContent.slice(0, 2000) };
        } catch (aiErr) {
          console.error("scrape-profile AI extraction failed", aiErr);
          extractedData = { raw_text: textContent.slice(0, 2000) };
        }
      } else {
        // Fallback: basic extraction without AI
        extractedData = { raw_text: textContent.slice(0, 2000) };
      }

      // Update the source with extracted data
      await adminClient
        .from("profile_sources")
        .update({
          status: "synced",
          last_synced_at: new Date().toISOString(),
          extracted_data: extractedData,
          error_message: null,
        })
        .eq("id", source_id);

      return new Response(JSON.stringify({ success: true, data: extractedData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (scrapeError: unknown) {
      const refused = scrapeError instanceof UnsafeUrlError;
      const errorMessage = scrapeError instanceof Error ? scrapeError.message : "Unknown error";
      await adminClient
        .from("profile_sources")
        .update({
          status: "error",
          error_message: errorMessage,
        })
        .eq("id", source_id);

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: refused ? 400 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
