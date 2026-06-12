import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROFILE_FIELDS = ['name','bio','avatar_url','cover_photo_url','city','country','sport_type','professional_title','languages','talent_level','availability','about_me','birth_date','phone','website'];

function profileCompletion(p: any): number {
  if (!p) return 0;
  const filled = PROFILE_FIELDS.filter(f => {
    const v = p[f];
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== undefined && String(v).trim() !== '';
  }).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnon, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claimsData.claims.sub as string;

    // Optionally target another user via ?user_id=
    const url = new URL(req.url);
    const targetId = url.searchParams.get('user_id') || userId;

    const admin = createClient(supabaseUrl, supabaseServiceKey);

    const [profileRes, levelRes, skillsRes, achRes, expRes, mediaRes, badgesRes, connRes, ratingsRes, postsRes, jobAppsRes, talentAppsRes] = await Promise.all([
      admin.from('profiles').select('*').eq('id', targetId).maybeSingle(),
      admin.from('user_levels').select('level, xp_total').eq('user_id', targetId).maybeSingle(),
      admin.from('user_skills').select('id', { count: 'exact', head: true }).eq('user_id', targetId),
      admin.from('talent_achievements').select('id', { count: 'exact', head: true }).eq('user_id', targetId),
      admin.from('talent_experiences').select('id', { count: 'exact', head: true }).eq('user_id', targetId),
      admin.from('talent_media').select('id', { count: 'exact', head: true }).eq('user_id', targetId),
      admin.from('profile_badges').select('badge_type').eq('user_id', targetId),
      admin.from('connections').select('id', { count: 'exact', head: true }).eq('user_id', targetId).eq('status', 'accepted'),
      admin.from('talent_ratings').select('rating', { count: 'exact' }).eq('talent_id', targetId),
      admin.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', targetId),
      admin.from('job_applications').select('status').eq('applicant_id', targetId),
      admin.from('talent_request_applications').select('status').eq('applicant_id', targetId),
    ]);

    const profile = profileRes.data;
    const completion = profileCompletion(profile);
    const skills = skillsRes.count || 0;
    const achievements = achRes.count || 0;
    const experiences = expRes.count || 0;
    const portfolio = mediaRes.count || 0;
    const verified = (badgesRes.data?.length || 0) > 0;
    const connections = connRes.count || 0;
    const ratingCount = ratingsRes.count || 0;
    const rating = Number(profile?.platform_rating) || 0;
    const posts = postsRes.count || 0;
    const acceptedOpps =
      (jobAppsRes.data || []).filter((a: any) => a.status === 'accepted').length +
      (talentAppsRes.data || []).filter((a: any) => a.status === 'accepted').length;
    const totalApps = (jobAppsRes.data?.length || 0) + (talentAppsRes.data?.length || 0);
    const level = levelRes.data?.level || 1;

    // Weighted breakdown (sum max = 100)
    const breakdown = {
      completion:     { score: Math.round(completion * 0.15), max: 15, label: 'Complétude du profil', value: `${completion}%` },
      skills:         { score: Math.min(skills, 10), max: 10, label: 'Compétences', value: `${skills}` },
      achievements:   { score: Math.min(achievements * 2, 10), max: 10, label: 'Réalisations', value: `${achievements}` },
      experiences:    { score: Math.min(experiences * 2, 10), max: 10, label: 'Expériences', value: `${experiences}` },
      portfolio:      { score: Math.min(portfolio, 15), max: 15, label: 'Portfolio (médias)', value: `${portfolio}` },
      verification:   { score: verified ? 10 : 0, max: 10, label: 'Profil vérifié', value: verified ? 'Oui' : 'Non' },
      recommendations:{ score: Math.min(Math.round(rating * (ratingCount > 0 ? 1.6 : 0)), 8), max: 8, label: 'Recommandations', value: rating ? `${rating.toFixed(1)}★ (${ratingCount})` : 'Aucune' },
      activity:       { score: Math.min(Math.round(posts * 0.5), 7), max: 7, label: 'Activité', value: `${posts} posts` },
      connections:    { score: Math.min(Math.round(connections * 0.5), 8), max: 8, label: 'Connexions', value: `${connections}` },
      opportunities:  { score: Math.min(acceptedOpps * 3, 7), max: 7, label: 'Opportunités obtenues', value: `${acceptedOpps}/${totalApps}` },
    };

    const total = Object.values(breakdown).reduce((s, b) => s + b.score, 0);

    // Tips
    const tips: { tip: string; gain: number; action_link?: string }[] = [];
    if (completion < 100) tips.push({ tip: `Complétez votre profil (${completion}%) — gagnez jusqu'à ${15 - breakdown.completion.score} pts`, gain: 15 - breakdown.completion.score, action_link: '/profile' });
    if (portfolio < 15) tips.push({ tip: `Ajoutez ${Math.max(3, 15 - portfolio)} médias à votre portfolio (photos, vidéos)`, gain: Math.min(15 - portfolio, 15 - breakdown.portfolio.score), action_link: '/profile' });
    if (!verified) tips.push({ tip: 'Faites vérifier votre profil pour +10 pts et plus de visibilité', gain: 10, action_link: '/verification' });
    if (skills < 10) tips.push({ tip: `Ajoutez ${10 - skills} compétences à votre profil`, gain: 10 - skills, action_link: '/profile' });
    if (achievements < 5) tips.push({ tip: 'Documentez vos réalisations clés (concours, prix, projets)', gain: 10 - breakdown.achievements.score, action_link: '/profile' });
    if (experiences < 5) tips.push({ tip: 'Ajoutez vos expériences professionnelles ou sportives', gain: 10 - breakdown.experiences.score, action_link: '/profile' });
    if (connections < 16) tips.push({ tip: 'Connectez-vous avec plus de talents et organisations', gain: 8 - breakdown.connections.score, action_link: '/yat-database' });
    if (ratingCount < 5) tips.push({ tip: 'Demandez des recommandations à vos collaborateurs', gain: 8 - breakdown.recommendations.score, action_link: '/friends' });
    if (posts < 14) tips.push({ tip: "Postez régulièrement pour booster votre activité", gain: 7 - breakdown.activity.score, action_link: '/feed' });

    const strengths = Object.values(breakdown).filter(b => b.score / b.max >= 0.7).map(b => b.label);
    const improvements = Object.values(breakdown).filter(b => b.score / b.max < 0.5).map(b => b.label);

    // Suggested initial token price (YAT Coin valuation) — 0..100 → $2..$50
    const suggestedTokenPrice = Math.round((2 + (total / 100) * 48) * 100) / 100;

    const next = tips.filter(t => t.gain > 0).sort((a, b) => b.gain - a.gain).slice(0, 3);
    const summary = total >= 80
      ? `Excellent ! Votre YAT Score est ${total}/100. Maintenez votre activité pour rester au top.`
      : `Votre YAT Score est ${total}/100. ${next[0]?.tip || ''} ${next[1] ? `puis : ${next[1].tip}.` : ''}`.trim();

    return new Response(JSON.stringify({
      yat_score: total,
      profile_completion: completion,
      breakdown,
      strengths,
      improvements,
      tips,
      summary,
      suggested_token_price: suggestedTokenPrice,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("yat-score error", error);
    return new Response(JSON.stringify({ error: error.message || "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
