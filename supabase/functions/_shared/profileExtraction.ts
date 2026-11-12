// Extraction par IA des informations de profil contenues dans un texte
// (page web d'une source externe, CV). Même format pour toutes les sources :
// l'application le relit dans src/lib/profileImport.ts.
import { aiCompleteJson } from "./ai.ts";

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

/**
 * Renvoie les informations de profil trouvées dans `text`.
 * `kind` oriente l'IA ; `origin` est un indice (URL ou nom de fichier).
 */
export async function extractProfileData(text: string, kind: "webpage" | "cv", origin = ""): Promise<ExtractedProfile> {
  const source = kind === "cv" ? "a CV / resume" : "a webpage";
  return await aiCompleteJson<ExtractedProfile>({
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
        content: `Extract the profile data${origin ? ` (source: ${origin})` : ""}:\n\n${text}`,
      },
    ],
  }, {});
}
