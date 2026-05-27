import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

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
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

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
      // Fetch the URL content
      const pageResponse = await fetch(source.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; YAT-Bot/1.0)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

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

      const html = await pageResponse.text();
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

      if (lovableApiKey) {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are a profile data extractor. Extract relevant information from a webpage for a talent/athlete profile. Return ONLY valid JSON with these fields (omit if not found):
{
  "name": "full name",
  "bio": "biography or about text",
  "achievements": [{"title": "...", "date": "...", "description": "..."}],
  "stats": {"key": "value pairs of any stats/ratings found"},
  "location": "city, country",
  "sport_or_specialty": "main activity",
  "skills": ["skill1", "skill2"],
  "photos": ["url1", "url2"],
  "social_links": [{"platform": "...", "url": "..."}],
  "education": [{"institution": "...", "degree": "...", "year": "..."}],
  "work_experience": [{"title": "...", "organization": "...", "period": "..."}]
}`
              },
              {
                role: "user",
                content: `Extract profile data from this page (URL: ${source.url}):\n\n${textContent}`
              }
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            try {
              extractedData = JSON.parse(content);
            } catch {
              extractedData = { raw_text: content };
            }
          }
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
      const errorMessage = scrapeError instanceof Error ? scrapeError.message : "Unknown error";
      await adminClient
        .from("profile_sources")
        .update({
          status: "error",
          error_message: errorMessage,
        })
        .eq("id", source_id);

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
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
