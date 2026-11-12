// Extraction par IA des informations de profil contenues dans un texte
// (page web d'une source externe, CV). Même format pour toutes les sources :
// l'application le relit dans src/lib/profileImport.ts.
import { AIError, aiComplete, aiCompleteJson, type AIRequest } from "./ai.ts";

export type ExtractedProfile = Record<string, unknown>;

const SCHEMA = `{
  "name": "full name",
  "professional_title": "current job title or main talent, a few words",
  "bio": "one or two sentences presenting the person",
  "about": "longer biography, if the text contains one",
  "location": "city, country",
  "sport_or_specialty": "main sport, art or field",
  "languages": ["French", "English"],
  "skills": ["skill1", "skill2"],
  "achievements": [{"title": "...", "date": "YYYY or YYYY-MM-DD", "description": "..."}],
  "education": [{"institution": "...", "degree": "...", "field": "...", "start_year": 2019, "end_year": 2022}],
  "work_experience": [{"title": "...", "organization": "...", "start_date": "YYYY-MM", "end_date": "YYYY-MM", "current": false, "city": "...", "description": "..."}],
  "social_links": [{"platform": "instagram", "url": "https://..."}],
  "stats": {"key": "value pairs of any stats or ratings found"},
  "photos": ["https://..."]
}`;

/** JSON object found in a free-text answer (models without a JSON mode wrap it in prose or fences). */
function parseLooseJson(raw: string): ExtractedProfile {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return {};
  try {
    const value = JSON.parse(raw.slice(start, end + 1));
    return value && typeof value === "object" && !Array.isArray(value) ? value as ExtractedProfile : {};
  } catch {
    return {};
  }
}

/**
 * Renvoie les informations de profil trouvées dans `text`.
 * `kind` oriente l'IA ; `origin` est un indice (URL ou nom de fichier).
 * Lève une AIError si le fournisseur d'IA refuse la demande.
 */
export async function extractProfileData(text: string, kind: "webpage" | "cv", origin = ""): Promise<ExtractedProfile> {
  const source = kind === "cv" ? "a CV / resume" : "a webpage";
  const request: AIRequest = {
    temperature: 0,
    maxTokens: 3500,
    messages: [
      {
        role: "system",
        content: `You are a profile data extractor. Extract the information about ONE person from ${source}, for a talent / athlete / artist profile.
Return ONLY valid JSON with these fields. Omit a field when the text does not contain it: never invent or guess.
Keep the original language of the text. Do not extract email addresses, phone numbers, postal addresses or dates of birth.
${SCHEMA}`,
      },
      {
        role: "user",
        content: `Extract the profile data${origin ? ` (source: ${origin})` : ""}:

${text}`,
      },
    ],
  };

  try {
    return await aiCompleteJson<ExtractedProfile>(request, {});
  } catch (e) {
    // A 400/422 usually means the model rejects a parameter (JSON mode, temperature…):
    // retry once as a plain completion with the provider defaults and read the JSON ourselves.
    if (!(e instanceof AIError) || (e.status !== 400 && e.status !== 422)) throw e;
    console.error("[profileExtraction] retry without JSON mode after", e.status, e.detail.slice(0, 300));
    const raw = await aiComplete({ messages: request.messages, maxTokens: request.maxTokens });
    return parseLooseJson(raw);
  }
}
