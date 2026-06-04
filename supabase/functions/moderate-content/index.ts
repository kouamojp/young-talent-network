import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const userClient = createClient(supabaseUrl, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { content, content_type = 'post', content_id, reported_user_id, manual_reason } = body;
    if (!content || typeof content !== 'string') {
      return new Response(JSON.stringify({ error: "content required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // If user manually reports, store directly with low AI involvement
    if (manual_reason) {
      const { data, error } = await admin.from('moderation_reports').insert({
        reported_user_id: reported_user_id || null,
        content_type,
        content_id: content_id || null,
        content_excerpt: content.slice(0, 500),
        risk_score: 50,
        risk_level: 'medium',
        categories: ['user-report'],
        reason: manual_reason,
        source: 'user',
        reporter_user_id: user.id,
        status: 'pending',
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, report: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // AI moderation
    const sys = `You are a content moderation engine for the YAT social platform.
Analyze the user-submitted content for SPAM, SCAM, FRAUD, PHISHING, FAKE_PROFILE, HARASSMENT, HATE_SPEECH, SEXUAL, VIOLENCE, IMPERSONATION, MISINFORMATION.
Return STRICT JSON: {"risk_score": 0-100, "risk_level": "low|medium|high|critical", "categories": ["spam","scam",...], "reason": "1-2 sentence explanation in English", "should_flag": boolean }
- low: 0-29, medium: 30-59, high: 60-84, critical: 85-100
- should_flag = true if risk_score >= 60 OR categories include scam/fraud/phishing/impersonation/hate_speech.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: content.slice(0, 4000) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error('AI moderation failed', aiResp.status, txt);
      return new Response(JSON.stringify({ error: "AI moderation failed", status: aiResp.status }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const aiJson = await aiResp.json();
    let parsed: any = {};
    try { parsed = JSON.parse(aiJson.choices?.[0]?.message?.content || '{}'); } catch { parsed = {}; }

    const risk_score = Math.max(0, Math.min(100, Number(parsed.risk_score) || 0));
    const risk_level = parsed.risk_level || (risk_score >= 85 ? 'critical' : risk_score >= 60 ? 'high' : risk_score >= 30 ? 'medium' : 'low');
    const categories = Array.isArray(parsed.categories) ? parsed.categories.slice(0, 10) : [];
    const reason = String(parsed.reason || '').slice(0, 1000);
    const should_flag = Boolean(parsed.should_flag) || risk_score >= 60;

    let report = null;
    if (should_flag) {
      const { data, error } = await admin.from('moderation_reports').insert({
        reported_user_id: reported_user_id || null,
        content_type,
        content_id: content_id || null,
        content_excerpt: content.slice(0, 500),
        risk_score,
        risk_level,
        categories,
        reason,
        source: 'ai-assistant',
        reporter_user_id: user.id,
        status: 'pending',
      }).select().single();
      if (error) console.error('insert error', error);
      report = data;
    }

    return new Response(JSON.stringify({ ok: true, risk_score, risk_level, categories, reason, flagged: should_flag, report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e: any) {
    console.error('moderate-content error', e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
