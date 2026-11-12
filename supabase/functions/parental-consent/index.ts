// Accord parental pour les 13-14 ans.
//
//   POST { action: "send" }            (connecté) envoie ou renvoie l'e-mail au parent
//   POST { action: "info", token }     (public)   prénom du jeune et état de la demande
//   POST { action: "confirm", token }  (public)   le parent donne son accord
//
// Secrets : RESEND_API_KEY, CONSENT_EMAIL_FROM (ex. "YAT <noreply@votre-domaine>"),
// APP_URL (ex. "https://yat.example.com"). Le jeton n'est jamais renvoyé au
// navigateur du mineur : il ne circule que dans l'e-mail envoyé au parent.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const RESEND_COOLDOWN_MS = 10 * 60 * 1000; // un envoi toutes les 10 minutes au plus
const TOKEN_TTL_DAYS = 14;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  let body: { action?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Requête invalide" }, 400);
  }

  try {
    if (body.action === "send") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return json({ error: "Connexion requise" }, 401);
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) return json({ error: "Connexion requise" }, 401);

      const { data: consent } = await admin
        .from("parental_consents")
        .select("parent_email, status, last_sent_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!consent) return json({ error: "Aucune demande d'accord parental pour ce compte" }, 404);
      if (consent.status === "granted") return json({ ok: true, alreadyGranted: true });
      if (consent.last_sent_at && Date.now() - new Date(consent.last_sent_at).getTime() < RESEND_COOLDOWN_MS) {
        return json({ error: "Un e-mail vient d'être envoyé. Réessayez dans quelques minutes." }, 429);
      }

      const resendKey = Deno.env.get("RESEND_API_KEY");
      const from = Deno.env.get("CONSENT_EMAIL_FROM");
      const appUrl = (Deno.env.get("APP_URL") || "").replace(/\/$/, "");
      if (!resendKey || !from || !appUrl) {
        return json({ error: "L'envoi d'e-mails n'est pas configuré (RESEND_API_KEY, CONSENT_EMAIL_FROM, APP_URL)." }, 500);
      }

      // Nouveau jeton à chaque envoi : seul le dernier lien reçu fonctionne.
      const token = crypto.randomUUID();
      const { error: updateError } = await admin
        .from("parental_consents")
        .update({ token, status: "pending", requested_at: new Date().toISOString(), last_sent_at: new Date().toISOString() })
        .eq("user_id", user.id);
      if (updateError) throw updateError;

      const { data: profile } = await admin.from("profiles").select("name").eq("id", user.id).maybeSingle();
      const childName = escapeHtml(profile?.name || "Votre enfant");
      const link = `${appUrl}/accord-parental?token=${token}`;

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#142033">
          <h2 style="color:#2563eb">Young &amp; Talented : accord parental</h2>
          <p>Bonjour,</p>
          <p><strong>${childName}</strong> a créé un compte sur Young &amp; Talented (YAT), une plateforme
          où les jeunes présentent leurs talents (sport, arts, musique…) et échangent avec d'autres jeunes,
          des agents et des organisations.</p>
          <p>Comme il ou elle a moins de 15 ans, votre accord est nécessaire avant d'utiliser la messagerie
          et les échanges avec les autres membres.</p>
          <p style="margin:28px 0">
            <a href="${link}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">
              Voir la demande et donner mon accord
            </a>
          </p>
          <p style="font-size:13px;color:#5a6880">Ce lien est valable ${TOKEN_TTL_DAYS} jours. Si vous ne connaissez pas
          ce compte ou refusez, ignorez simplement cet e-mail : la messagerie restera désactivée.
          Vous pouvez demander la suppression du compte à tout moment depuis la page du lien.</p>
        </div>`;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [consent.parent_email],
          subject: `Accord parental pour le compte YAT de ${profile?.name || "votre enfant"}`,
          html,
        }),
      });
      if (!res.ok) {
        console.error("Resend error", res.status, await res.text());
        // L'envoi a échoué : on libère le délai d'attente pour permettre un nouvel essai.
        await admin.from("parental_consents").update({ last_sent_at: null }).eq("user_id", user.id);
        return json({ error: "L'e-mail n'a pas pu être envoyé. Vérifiez l'adresse du parent." }, 502);
      }
      return json({ ok: true });
    }

    if (body.action === "info" || body.action === "confirm") {
      const token = body.token || "";
      if (!UUID_RE.test(token)) return json({ error: "Lien invalide" }, 400);

      const { data: consent } = await admin
        .from("parental_consents")
        .select("user_id, status, requested_at")
        .eq("token", token)
        .maybeSingle();
      if (!consent) return json({ error: "Ce lien n'est plus valable. Demandez à votre enfant d'en renvoyer un." }, 404);

      const expired = Date.now() - new Date(consent.requested_at).getTime() > TOKEN_TTL_DAYS * 86400_000;
      if (expired && consent.status !== "granted") {
        return json({ error: "Ce lien a expiré. Demandez à votre enfant d'en renvoyer un." }, 410);
      }

      const { data: profile } = await admin.from("profiles").select("name").eq("id", consent.user_id).maybeSingle();
      const childName = profile?.name || "Votre enfant";

      if (body.action === "info") return json({ childName, status: consent.status });

      if (consent.status !== "granted") {
        const { error } = await admin
          .from("parental_consents")
          .update({ status: "granted", granted_at: new Date().toISOString() })
          .eq("token", token);
        if (error) throw error;
      }
      return json({ ok: true, childName });
    }

    return json({ error: "Action inconnue" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "Erreur serveur" }, 500);
  }
});
