-- =============================================================================
-- Profils : l'e-mail, le téléphone et la date de naissance ne sont plus
-- lisibles via l'API par les autres membres ni par les visiteurs anonymes.
--
-- La policy « Profiles are viewable by everyone » (USING true) reste en place
-- pour les autres colonnes. La protection passe par les droits de colonnes :
-- anon et authenticated n'ont plus SELECT que sur les colonnes non sensibles.
-- Conséquence : `select('*')` sur profiles est refusé, il faut lister les
-- colonnes (voir PROFILE_PUBLIC_COLUMNS dans src/lib/profiles.ts).
--
-- Accès aux colonnes sensibles, uniquement via les fonctions ci-dessous :
--   get_profile_private(ids)   soi-même ou admin (e-mail seul pour un compte lié)
--   get_public_contact(id)     coordonnées professionnelles (agents, organisations,
--                              talents majeurs avec un CV public)
--   get_profile_ages(ids)      âge en années, jamais la date exacte
--   search_profiles_for_link() recherche pour lier un compte, e-mail exact seulement
--
-- IMPORTANT : une nouvelle colonne ajoutée à profiles n'est PAS lisible par
-- défaut. Ajoutez un GRANT SELECT (colonne) si elle doit être publique.
-- =============================================================================

-- La vue profiles_public (security_invoker) lit birthday/email/phone : elle
-- échouerait après la révocation. Elle n'est pas utilisée par l'application,
-- on la recrée sans ces colonnes.
DROP VIEW IF EXISTS public.profiles_public;

REVOKE SELECT ON public.profiles FROM anon, authenticated;

DO $$
DECLARE
  _cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
    INTO _cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name NOT IN ('email', 'phone', 'birthday');

  EXECUTE format('GRANT SELECT (%s) ON public.profiles TO anon, authenticated', _cols);
END $$;

CREATE VIEW public.profiles_public
WITH (security_invoker = true)
AS
SELECT
  id, name, avatar_url, sport_type, user_type, city, country,
  updated_at, created_at, bio, location, rating_count, platform_rating,
  cover_photo_url, website, category_id
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Colonnes privées : soi-même, admin, ou e-mail d'un compte lié
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_profile_private(_ids uuid[])
RETURNS TABLE (id uuid, email text, phone text, birthday date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.email,
    CASE WHEN p.id = auth.uid() OR public.has_role(auth.uid(), 'admin') THEN p.phone END,
    CASE WHEN p.id = auth.uid() OR public.has_role(auth.uid(), 'admin') THEN p.birthday END
  FROM public.profiles p
  WHERE p.id = ANY(_ids)
    AND auth.uid() IS NOT NULL
    AND (
      p.id = auth.uid()
      OR public.has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1 FROM public.account_links l
        WHERE (l.owner_user_id = auth.uid() AND l.linked_user_id = p.id)
           OR (l.linked_user_id = auth.uid() AND l.owner_user_id = p.id)
      )
    );
$$;

-- ---------------------------------------------------------------------------
-- Coordonnées affichables publiquement
-- ---------------------------------------------------------------------------
-- Les agents et organisations sont des contacts professionnels. Un talent
-- majeur n'expose ses coordonnées que s'il a publié un CV public. Les
-- coordonnées d'un mineur ne sont jamais publiques.
CREATE OR REPLACE FUNCTION public.get_public_contact(_user_id uuid)
RETURNS TABLE (email text, phone text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.email, p.phone
  FROM public.profiles p
  WHERE p.id = _user_id
    AND (
      p.id = auth.uid()
      OR (
        NOT public.is_minor(p.id)
        AND (
          p.user_type IN ('agent', 'organization')
          OR EXISTS (SELECT 1 FROM public.talent_resumes r WHERE r.user_id = p.id AND r.is_public)
        )
      )
    );
$$;

-- ---------------------------------------------------------------------------
-- Âge (pour l'affichage et les filtres de recherche), jamais la date exacte
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_profile_ages(_ids uuid[])
RETURNS TABLE (id uuid, age integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, public.age_years(p.birthday)
  FROM public.profiles p
  WHERE p.id = ANY(_ids) AND p.birthday IS NOT NULL;
$$;

-- ---------------------------------------------------------------------------
-- Recherche d'un compte à lier : par nom, ou par e-mail EXACT (pas de
-- recherche partielle sur les e-mails, qui permettrait de les énumérer).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.search_profiles_for_link(_query text)
RETURNS TABLE (id uuid, name text, avatar_url text, user_type text, email_hint text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id, p.name, p.avatar_url, p.user_type,
    CASE WHEN p.email IS NULL OR position('@' in p.email) = 0 THEN NULL
         ELSE left(p.email, 2) || '***' || substr(p.email, position('@' in p.email)) END
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND length(trim(_query)) >= 2
    AND p.id <> auth.uid()
    AND (lower(p.email) = lower(trim(_query)) OR p.name ILIKE '%' || trim(_query) || '%')
  ORDER BY (lower(p.email) = lower(trim(_query))) DESC, p.name
  LIMIT 8;
$$;

REVOKE EXECUTE ON FUNCTION public.get_profile_private(uuid[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.search_profiles_for_link(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_profile_private(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_profiles_for_link(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_contact(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_ages(uuid[]) TO anon, authenticated;
