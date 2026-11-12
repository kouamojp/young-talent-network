// Analyse d'un CV : reçoit le TEXTE du CV (extrait du PDF dans le navigateur)
// et renvoie les informations de profil trouvées, au même format que les
// sources externes. Rien n'est enregistré : l'utilisateur choisit ensuite, dans
// l'application, ce qu'il reprend dans son profil.
//
//   POST { text: string, fileName?: string }  ->  { data: {...} }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isAIConfigured } from "../_shared/ai.ts";
import { extractProfileData } from "../_shared/profileExtraction.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const MAX_CHARS = 20_000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Connexion requise" }, 401);
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "Connexion requise" }, 401);

  if (!isAIConfigured()) return json({ error: "L'analyse par IA n'est pas configurée." }, 503);

  let body: { text?: unknown; fileName?: unknown };
  try { body = await req.json(); } catch { return json({ error: "Requête invalide" }, 400); }
  const text = typeof body.text === "string" ? body.text.replace(/\s+/g, " ").trim() : "";
  if (text.length < 80) return json({ error: "Le CV ne contient pas assez de texte lisible. S'il s'agit d'un scan (image), utilisez un PDF avec du texte." }, 422);

  try {
    const fileName = typeof body.fileName === "string" ? body.fileName.slice(0, 120) : "";
    const data = await extractProfileData(text.slice(0, MAX_CHARS), "cv", fileName);
    if (Object.keys(data).length === 0) return json({ error: "Aucune information n'a pu être extraite de ce CV." }, 422);
    return json({ data });
  } catch (e) {
    console.error("parse-cv", e);
    return json({ error: "L'analyse du CV a échoué. Réessayez dans un instant." }, 502);
  }
});
