// Identifiants TURN temporaires pour les appels audio / vidéo.
//
// Deux fournisseurs possibles (le premier configuré est utilisé) :
//   1. coturn (ou tout serveur compatible « TURN REST API ») :
//        TURN_URLS          ex. "turn:turn.exemple.com:3478,turns:turn.exemple.com:5349"
//        TURN_SHARED_SECRET le static-auth-secret du serveur
//   2. Metered.ca :
//        METERED_DOMAIN     ex. "monapp.metered.live"
//        METERED_API_KEY
// Sans configuration, la fonction répond 404 et le navigateur garde sa
// configuration de secours (variables VITE_TURN_* ou relais public).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const TTL_SECONDS = 6 * 3600;

async function hmacSha1Base64(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Connexion requise" }, 401);
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "Connexion requise" }, 401);

  try {
    const urls = (Deno.env.get("TURN_URLS") || "").split(",").map(u => u.trim()).filter(Boolean);
    const secret = Deno.env.get("TURN_SHARED_SECRET");
    if (urls.length && secret) {
      const username = `${Math.floor(Date.now() / 1000) + TTL_SECONDS}:${user.id}`;
      const credential = await hmacSha1Base64(secret, username);
      return json({
        ttl: TTL_SECONDS,
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls, username, credential }],
      });
    }

    const domain = Deno.env.get("METERED_DOMAIN");
    const apiKey = Deno.env.get("METERED_API_KEY");
    if (domain && apiKey) {
      const res = await fetch(`https://${domain}/api/v1/turn/credentials?apiKey=${encodeURIComponent(apiKey)}`);
      if (!res.ok) {
        console.error("Metered error", res.status, await res.text());
        return json({ error: "Fournisseur TURN indisponible" }, 502);
      }
      const iceServers = await res.json();
      return json({ ttl: 3600, iceServers });
    }

    return json({ error: "TURN non configuré" }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: "Erreur serveur" }, 500);
  }
});
