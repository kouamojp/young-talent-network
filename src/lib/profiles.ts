import { supabase } from '@/integrations/supabase/client';

/**
 * Columns of `profiles` readable through the API. `email`, `phone` and
 * `birthday` are private (column privileges, migration
 * 20261112120000_profiles_private_columns): `select('*')` on profiles is
 * refused, so always select from this list and fetch private data through
 * the helpers below.
 */
// Kept as a single string literal so supabase-js can infer the row type.
export const PROFILE_PUBLIC_COLUMNS = 'id, name, user_type, avatar_url, cover_photo_url, bio, about_me, professional_title, city, country, location, latitude, longitude, website, languages, availability, sport_type, talent_level, category_id, platform_rating, rating_count, created_at, updated_at' as const;

export interface ProfilePrivate { id: string; email: string | null; phone: string | null; birthday: string | null }

/** Private columns for the signed-in user, an admin, or (email only) a linked account. */
export async function fetchProfilePrivate(ids: string[]): Promise<Record<string, ProfilePrivate>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return {};
  const { data, error } = await (supabase.rpc as any)('get_profile_private', { _ids: unique });
  if (error) { console.error('get_profile_private', error); return {}; }
  return Object.fromEntries(((data || []) as ProfilePrivate[]).map(r => [r.id, r]));
}

/** Own profile with its private columns merged in. */
export async function fetchOwnProfile(userId: string) {
  const [{ data, error }, priv] = await Promise.all([
    supabase.from('profiles').select(PROFILE_PUBLIC_COLUMNS).eq('id', userId).maybeSingle(),
    fetchProfilePrivate([userId]),
  ]);
  if (error || !data) return { data: null, error };
  const p = priv[userId];
  return { data: { ...(data as any), email: p?.email ?? null, phone: p?.phone ?? null, birthday: p?.birthday ?? null }, error: null };
}

/** Ages in years by profile id (the exact date of birth is never exposed). */
export async function fetchProfileAges(ids: string[]): Promise<Record<string, number>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return {};
  const { data, error } = await (supabase.rpc as any)('get_profile_ages', { _ids: unique });
  if (error) { console.error('get_profile_ages', error); return {}; }
  return Object.fromEntries(((data || []) as { id: string; age: number }[]).map(r => [r.id, r.age]));
}

/**
 * Contact details that may be shown publicly: agents, organizations, and adult
 * talents with a public CV. Always empty for minors.
 */
export async function fetchPublicContact(userId: string): Promise<{ email: string | null; phone: string | null }> {
  const { data } = await (supabase.rpc as any)('get_public_contact', { _user_id: userId });
  const row = (data || [])[0];
  return { email: row?.email ?? null, phone: row?.phone ?? null };
}
