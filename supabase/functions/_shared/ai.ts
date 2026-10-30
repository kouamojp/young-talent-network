/**
 * Couche d'accès IA partagée par toutes les Edge Functions YAT.
 *
 * Fournisseur par défaut : Moonshot (Kimi), API OpenAI-compatible.
 * On bascule de fournisseur sans toucher au code via le secret AI_PROVIDER
 * ("moonshot" | "lovable" | "openrouter" | "haimaker"). Une requête peut aussi
 * demander son propre fournisseur (AIRequest.provider). Si la clé du fournisseur demandé
 * est absente, on retombe sur le premier fournisseur dont la clé est définie —
 * ce qui rend la migration réversible en changeant un seul secret.
 *
 * Secrets attendus (au moins un) :
 *   MOONSHOT_API_KEY   — https://platform.kimi.ai
 *   LOVABLE_API_KEY    — ancien gateway, conservé comme repli
 *   OPENROUTER_API_KEY — optionnel
 *   HAIMAKER_API_KEY   — https://haimaker.ai (GLM, utilisé par l'assistant IA)
 */

export type AIMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * fast      — tâches courtes et fréquentes (traduction, classification, résumé)
 * default   — beaucoup de contexte, raisonnement léger (chat, matching, extraction)
 * reasoning — la qualité prime sur le coût et la latence
 */
export type ModelTier = "fast" | "default" | "reasoning";

export type ProviderName = "moonshot" | "lovable" | "openrouter" | "haimaker";

interface Provider {
  baseUrl: string;
  keyEnv: string;
  models: Record<ModelTier, string>;
}

const PROVIDERS: Record<ProviderName, Provider> = {
  moonshot: {
    baseUrl: "https://api.moonshot.ai/v1",
    keyEnv: "MOONSHOT_API_KEY",
    // kimi-k2.5 et la série moonshot-v1 ferment le 31/08/2026 : ne pas les utiliser.
    models: { fast: "kimi-k2.6", default: "kimi-k2.6", reasoning: "kimi-k3" },
  },
  lovable: {
    baseUrl: "https://ai.gateway.lovable.dev/v1",
    keyEnv: "LOVABLE_API_KEY",
    models: {
      fast: "google/gemini-2.5-flash-lite",
      default: "google/gemini-2.5-flash",
      reasoning: "google/gemini-2.5-pro",
    },
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    keyEnv: "OPENROUTER_API_KEY",
    models: {
      fast: "moonshotai/kimi-k2.6",
      default: "moonshotai/kimi-k2.6",
      reasoning: "moonshotai/kimi-k2.6",
    },
  },
  haimaker: {
    baseUrl: "https://api.haimaker.ai/v1",
    keyEnv: "HAIMAKER_API_KEY",
    models: { fast: "z-ai/glm-5.2", default: "z-ai/glm-5.2", reasoning: "z-ai/glm-5.2" },
  },
};

const PROVIDER_ORDER: ProviderName[] = ["moonshot", "lovable", "openrouter", "haimaker"];

const DEFAULT_MAX_TOKENS = 2048;
const DEFAULT_TEMPERATURE = 0.3;

export interface ResolvedProvider {
  name: ProviderName;
  provider: Provider;
  apiKey: string;
}

export function resolveProvider(requested?: ProviderName): ResolvedProvider | null {
  const preferred = (requested || Deno.env.get("AI_PROVIDER") || "moonshot").toLowerCase() as ProviderName;
  const order = PROVIDER_ORDER.includes(preferred)
    ? [preferred, ...PROVIDER_ORDER.filter((p) => p !== preferred)]
    : PROVIDER_ORDER;

  for (const name of order) {
    const provider = PROVIDERS[name];
    const apiKey = Deno.env.get(provider.keyEnv);
    if (apiKey) return { name, provider, apiKey };
  }
  return null;
}

/** Pour les fonctions où l'IA est un bonus optionnel (scraping, enrichissement). */
export function isAIConfigured(): boolean {
  return resolveProvider() !== null;
}

export class AIError extends Error {
  constructor(message: string, readonly status: number, readonly detail = "") {
    super(message);
    this.name = "AIError";
  }
}

export interface AIRequest {
  messages: AIMessage[];
  tier?: ModelTier;
  /**
   * Fournisseur voulu pour cet appel, prioritaire sur AI_PROVIDER. Sans sa clé,
   * on retombe sur la résolution habituelle.
   */
  provider?: ProviderName;
  /** Force un modèle précis, court-circuite le tier. */
  model?: string;
  json?: boolean;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  /**
   * Laisse le modèle raisonner avant de répondre. Désactivé par défaut :
   * sur les modèles Kimi le raisonnement gonfle la latence et les tokens de
   * sortie, et il n'apporte rien aux tâches d'extraction ou de classification.
   */
  reasoning?: boolean;
}

/**
 * Moonshot, comme OpenAI, exige que le prompt décrive explicitement le JSON
 * attendu quand response_format vaut json_object. Filet de sécurité au cas où
 * un appelant l'oublierait.
 */
function withJsonHint(messages: AIMessage[]): AIMessage[] {
  if (messages.some((m) => /json/i.test(m.content))) return messages;

  const hint = "Respond with a single valid JSON object and nothing else.";
  const [first, ...rest] = messages;
  if (first?.role === "system") {
    return [{ ...first, content: `${first.content}\n\n${hint}` }, ...rest];
  }
  return [{ role: "system", content: hint }, ...messages];
}

function buildBody(req: AIRequest, { name, provider }: ResolvedProvider): Record<string, unknown> {
  // Un modèle forcé n'a de sens que chez le fournisseur effectivement résolu.
  const model = (req.provider && req.provider !== name ? undefined : req.model) ?? provider.models[req.tier ?? "default"];
  const maxTokens = req.maxTokens ?? DEFAULT_MAX_TOKENS;

  const body: Record<string, unknown> = {
    model,
    messages: req.json ? withJsonHint(req.messages) : req.messages,
    temperature: req.temperature ?? DEFAULT_TEMPERATURE,
  };
  if (req.stream) body.stream = true;
  if (req.json) body.response_format = { type: "json_object" };

  if (name === "moonshot") {
    // max_tokens est déprécié côté Moonshot et le défaut de K3 monte à 131k :
    // on plafonne toujours explicitement.
    body.max_completion_tokens = maxTokens;

    if (model.startsWith("kimi-k3")) {
      // K3 raisonne toujours ; on ne peut que doser l'effort (défaut "max").
      body.reasoning_effort = req.reasoning ? "high" : "low";
    } else if (model.startsWith("kimi-k2")) {
      body.thinking = { type: req.reasoning ? "enabled" : "disabled" };
    }
  } else {
    body.max_tokens = maxTokens;
  }

  return body;
}

function errorMessage(status: number): string {
  if (status === 401 || status === 403) return "AI credentials rejected";
  if (status === 402) return "Credits exhausted";
  if (status === 429) return "Rate limited";
  return "AI provider error";
}

/** Appel bas niveau. Lève une AIError si le fournisseur répond une erreur. */
export async function aiFetch(req: AIRequest): Promise<Response> {
  const resolved = resolveProvider(req.provider);
  if (!resolved) throw new AIError("AI not configured", 503);

  const res = await fetch(`${resolved.provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resolved.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildBody(req, resolved)),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`[ai] ${resolved.name} ${res.status}`, detail.slice(0, 500));
    throw new AIError(errorMessage(res.status), res.status, detail);
  }
  return res;
}

/** Réponse texte complète. */
export async function aiComplete(req: AIRequest): Promise<string> {
  const res = await aiFetch({ ...req, stream: false });
  const data = await res.json();
  return String(data.choices?.[0]?.message?.content ?? "").trim();
}

const CODE_FENCE = /^```(?:json)?\s*|\s*```$/g;

/**
 * Réponse JSON parsée. Les erreurs fournisseur remontent en AIError ; un JSON
 * illisible retombe silencieusement sur `fallback`, comme le faisait chaque
 * fonction avant la centralisation.
 */
export async function aiCompleteJson<T>(req: AIRequest, fallback: T): Promise<T> {
  const raw = await aiComplete({ ...req, json: true });
  try {
    return JSON.parse(raw.replace(CODE_FENCE, "")) as T;
  } catch {
    console.error("[ai] réponse JSON illisible", raw.slice(0, 300));
    return fallback;
  }
}

/** Réponse SSE relayée telle quelle au navigateur (format OpenAI). */
export async function aiStream(
  req: AIRequest,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  const res = await aiFetch({ ...req, stream: true });
  return new Response(res.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

/** Traduit n'importe quelle erreur (AIError ou non) en réponse HTTP JSON. */
export function aiErrorResponse(error: unknown, corsHeaders: Record<string, string>): Response {
  const status = error instanceof AIError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Internal error";
  return new Response(JSON.stringify({ error: message }), {
    status: status >= 400 && status <= 599 ? status : 502,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
