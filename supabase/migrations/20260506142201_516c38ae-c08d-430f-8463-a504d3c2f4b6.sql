
-- Recreate views with SECURITY INVOKER
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = true)
AS
SELECT
  id, name, avatar_url, sport_type, user_type, city, country, birthday,
  updated_at, created_at, bio, location, rating_count, platform_rating,
  cover_photo_url, website, category_id,
  CASE WHEN auth.uid() = id THEN email ELSE null END AS email,
  CASE WHEN auth.uid() = id THEN phone ELSE null END AS phone
FROM public.profiles;

CREATE OR REPLACE VIEW public.agent_profiles_public
WITH (security_invoker = true)
AS
SELECT
  id, user_id, agency_name, bio, avatar_url, location, phone, specialization,
  commission_rate, clients_represented, verified, created_at, email, website,
  deals_completed, updated_at, services, category,
  CASE WHEN auth.uid() = user_id THEN license_number ELSE null END AS license_number
FROM public.agent_profiles;
