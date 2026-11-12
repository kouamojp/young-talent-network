/** Âge minimum pour s'inscrire sur YAT. */
export const MIN_AGE = 13;
/** En dessous de cet âge, l'accord d'un parent est obligatoire (âge du consentement numérique en France). */
export const PARENTAL_CONSENT_AGE = 15;

/** Âge en années révolues à partir d'une date `YYYY-MM-DD`, ou null si la date est vide ou invalide. */
export const ageFromBirthday = (birthday: string): number | null => {
  if (!birthday) return null;
  const d = new Date(`${birthday}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const beforeBirthday = now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};
