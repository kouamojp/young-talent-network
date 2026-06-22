-- Self-service account deletion.
-- The client only has the anon key and cannot call auth.admin.deleteUser, so we
-- expose a SECURITY DEFINER RPC that deletes the *currently authenticated* user
-- from auth.users. The profiles.id -> auth.users(id) ON DELETE CASCADE chain
-- (and every public table referencing profiles with ON DELETE CASCADE) cleans up
-- all of the user's data automatically.

CREATE OR REPLACE FUNCTION public.delete_current_user()
RETURNS void AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM auth.users WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Only authenticated users may delete their own account.
REVOKE ALL ON FUNCTION public.delete_current_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_current_user() TO authenticated;
