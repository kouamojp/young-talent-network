
CREATE OR REPLACE FUNCTION public.sync_linked_account(_link_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _link record;
  _src record;
  _allowed text[] := ARRAY['name','avatar_url','bio','city','country','phone','website','cover_photo_url','sport_type'];
  _fields text[];
BEGIN
  SELECT * INTO _link FROM public.account_links WHERE id = _link_id;
  IF _link IS NULL THEN RAISE EXCEPTION 'Link not found'; END IF;
  IF _link.owner_user_id <> auth.uid() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF _link.status <> 'accepted' THEN RAISE EXCEPTION 'Link not accepted'; END IF;

  SELECT * INTO _src FROM public.profiles WHERE id = _link.owner_user_id;
  IF _src IS NULL THEN RAISE EXCEPTION 'Source profile missing'; END IF;

  SELECT array_agg(f) INTO _fields
  FROM unnest(_link.sync_fields) f WHERE f = ANY(_allowed);

  IF _fields IS NULL OR array_length(_fields, 1) = 0 THEN
    RAISE EXCEPTION 'No fields to sync';
  END IF;

  UPDATE public.profiles SET
    name = CASE WHEN 'name' = ANY(_fields) THEN _src.name ELSE name END,
    avatar_url = CASE WHEN 'avatar_url' = ANY(_fields) THEN _src.avatar_url ELSE avatar_url END,
    bio = CASE WHEN 'bio' = ANY(_fields) THEN _src.bio ELSE bio END,
    city = CASE WHEN 'city' = ANY(_fields) THEN _src.city ELSE city END,
    country = CASE WHEN 'country' = ANY(_fields) THEN _src.country ELSE country END,
    phone = CASE WHEN 'phone' = ANY(_fields) THEN _src.phone ELSE phone END,
    website = CASE WHEN 'website' = ANY(_fields) THEN _src.website ELSE website END,
    cover_photo_url = CASE WHEN 'cover_photo_url' = ANY(_fields) THEN _src.cover_photo_url ELSE cover_photo_url END,
    sport_type = CASE WHEN 'sport_type' = ANY(_fields) THEN _src.sport_type ELSE sport_type END,
    updated_at = now()
  WHERE id = _link.linked_user_id;

  UPDATE public.account_links SET last_synced_at = now() WHERE id = _link_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_linked_account(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.sync_linked_account(uuid) TO authenticated;
