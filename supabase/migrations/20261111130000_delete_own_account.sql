-- Lets a signed-in user permanently delete their own account.
-- Deleting the auth.users row cascades to profiles and every table that
-- references it with ON DELETE CASCADE. The two audit columns below have no
-- cascade, so they are cleared first to avoid a foreign-key error when the
-- user is an admin who reviewed requests or granted badges.
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  UPDATE public.verification_requests SET reviewed_by = NULL WHERE reviewed_by = _uid;
  UPDATE public.profile_badges SET granted_by = NULL WHERE granted_by = _uid;

  DELETE FROM auth.users WHERE id = _uid;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
