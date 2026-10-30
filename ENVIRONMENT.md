# Variables d'environnement

YAT lit sa configuration à trois endroits, qui ne se mélangent pas :

| Fichier | Lu par | Visible dans le navigateur ? |
|---|---|---|
| `.env` (racine) | Vite, au build et en dev | Oui, pour les variables `VITE_*` |
| `supabase/functions/.env` | `supabase functions serve` (local) et `supabase secrets set` | Non |
| Secrets Supabase (en ligne) | Les Edge Functions déployées | Non |

Règle simple : **une clé secrète ne va jamais dans une variable `VITE_*`.** Tout ce qui commence par
`VITE_` est copié dans le JavaScript envoyé aux visiteurs. Les clés d'API (IA, Telegram…) vont dans
`supabase/functions/.env`, puis dans les secrets Supabase.

Les deux fichiers `.env` sont ignorés par git. Des modèles sans valeurs sont versionnés :
`.env.example` et `supabase/functions/.env.example`.

## 1. Front-end : `.env`

```bash
cp .env.example .env
```

| Variable | Obligatoire | Rôle | Où la trouver |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Oui | URL du projet Supabase | Dashboard → Project Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Oui | Clé publique (anon) du projet | Même page, « anon / publishable key » |
| `VITE_SUPABASE_PROJECT_ID` | Non | Référence du projet, pour mémoire (le code ne la lit pas) | Dans l'URL : `https://<ref>.supabase.co` |
| `VITE_TURN_URL` | Non | Serveur TURN pour les appels audio/vidéo | Votre fournisseur TURN |
| `VITE_TURN_USERNAME` | Non | Identifiant TURN | Votre fournisseur TURN |
| `VITE_TURN_CREDENTIAL` | Non | Mot de passe TURN | Votre fournisseur TURN |

Sans variables TURN, les appels utilisent le relais public gratuit `openrelay.metered.ca`. Il suffit
pour tester, mais il n'est pas fiable en production. Ces identifiants TURN finissent dans le
navigateur : utilisez des identifiants dédiés aux appels, jamais un compte d'administration.

Variables utilisées seulement par le CLI Supabase sur votre machine (facultatives, jamais lues par l'app) :

| Variable | Rôle |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Évite `supabase login` (jeton personnel : Account → Access Tokens) |
| `SUPABASE_DB_PASSWORD` | Mot de passe Postgres, demandé par `supabase db push` / `link` |

> Le projet Supabase visé par l'app (`VITE_SUPABASE_URL`) doit être le même que celui auquel le CLI
> est lié (`project_id` dans `supabase/config.toml`). Sinon les fonctions se déploient sur un projet
> et l'app appelle l'autre : toutes les fonctions répondent alors 404, ce que le navigateur
> affiche comme une erreur CORS.

Après une modification de `.env`, relancez `npm run dev` : Vite ne relit pas ce fichier à chaud.

## 2. Edge Functions : `supabase/functions/.env`

```bash
cp supabase/functions/.env.example supabase/functions/.env
```

### IA

Toutes les fonctions IA passent par `supabase/functions/_shared/ai.ts`. Une seule clé suffit :
si le fournisseur demandé n'a pas de clé, le module prend le premier qui en a une.

| Variable | Rôle |
|---|---|
| `HAIMAKER_API_KEY` | Clé [haimaker](https://app.haimaker.ai) (`sk-…`). L'Assistant IA l'utilise en priorité (modèle `z-ai/glm-5.2`). |
| `MOONSHOT_API_KEY` | Clé [Moonshot / Kimi](https://platform.kimi.ai). Fournisseur par défaut des autres fonctions IA. |
| `OPENROUTER_API_KEY` | Clé [OpenRouter](https://openrouter.ai), facultative. |
| `LOVABLE_API_KEY` | Ancienne passerelle Lovable, conservée comme repli. |
| `AI_PROVIDER` | Fournisseur préféré : `moonshot` (défaut), `haimaker`, `openrouter` ou `lovable`. |

Points d'attention :

- Copiez la clé haimaker en entier, préfixe `sk-` compris. Sans lui, l'API répond `invalid_api_key`.
- haimaker ne débloque une clé qu'une fois du crédit ajouté sur le compte (10 $ minimum). Sinon,
  l'API répond `402 budget_exceeded` et l'assistant affiche une erreur de crédit.
- Si `HAIMAKER_API_KEY` est la seule clé définie, **toutes** les fonctions IA (traduction,
  modération, suggestions…) passent par haimaker.

### Connexion Telegram

| Variable | Rôle |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Jeton du bot, fourni par [@BotFather](https://t.me/BotFather) (`/newbot`) |
| `TELEGRAM_BOT_USERNAME` | Nom du bot, sans `@` (ex. `yat_login_bot`) |

Dans @BotFather, déclarez aussi le domaine du site avec `/setdomain`. Sans cette étape, le widget
de connexion Telegram refuse de s'afficher. Tant que ces deux secrets manquent, `telegram-auth`
répond « Telegram bot not configured ».

### Variables fournies automatiquement

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` et `SUPABASE_DB_URL` sont injectées
par Supabase dans chaque fonction. Ne les mettez pas dans `supabase/functions/.env` : la commande
`secrets set` refuse les noms qui commencent par `SUPABASE_`.

## 3. Envoyer les secrets et déployer

Installez le CLI une fois (Windows, avec Scoop) :

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
supabase login
```

Puis, depuis la racine du projet :

```powershell
supabase link --project-ref <ref-du-projet>          # le même projet que VITE_SUPABASE_URL
supabase secrets set --env-file supabase/functions/.env
supabase functions deploy                            # ou: supabase functions deploy ai-assistant
supabase secrets list                                # vérifie les noms (les valeurs sont masquées)
```

Une modification de secret est prise en compte au prochain appel de la fonction, sans redéploiement.

Pour tester les fonctions en local, `supabase functions serve` lit `supabase/functions/.env`
automatiquement.

## 4. Configuré ailleurs que dans un `.env`

| Réglage | Où |
|---|---|
| Connexion Google | Supabase → Authentication → Providers → Google (Client ID / Secret Google Cloud) |
| URL de redirection après connexion | Supabase → Authentication → URL Configuration (ajoutez `http://localhost:8080` pour le dev) |
| Connexion VK ID | Identifiant d'application écrit en dur dans `src/components/auth/VKLoginButton.tsx` (`VK_APP_ID`). Les domaines autorisés se règlent dans le cabinet VK ID ; sans `localhost`, VK bloque les appels en dev (erreurs CORS sur `id.vk.ru`). |
| Carte Mapbox (Karta) | Le jeton public Mapbox est saisi par l'utilisateur dans l'interface, pas dans un `.env`. |

## Dépannage

| Symptôme | Cause probable |
|---|---|
| Erreur CORS « does not have HTTP ok status » sur `/functions/v1/…` | Fonction non déployée sur le projet de `VITE_SUPABASE_URL` (404) |
| `telegram-auth` : « Telegram bot not configured » | `TELEGRAM_BOT_TOKEN` / `TELEGRAM_BOT_USERNAME` absents des secrets |
| Assistant IA : `invalid_api_key` | Clé haimaker tronquée (préfixe `sk-` manquant) |
| Assistant IA : erreur de crédit / `402` | Compte haimaker sans crédit |
| Assistant IA : `Unauthorized` | Normal sans être connecté : l'assistant exige une session |
| `supabase` n'est pas reconnu | CLI non installé : voir la section 3, ou préfixez par `npx` |
