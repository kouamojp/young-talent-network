-- Fix: OAuth (Google/Apple) sign-ups created profiles with an empty name and
-- no avatar, because handle_new_user only read raw_user_meta_data->>'name'.
-- Google stores the display name under 'full_name' / 'name' and the photo
-- under 'picture' / 'avatar_url'. Fall back through all of them.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'talent'),
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1),
      ''
    ),
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Backfill existing profiles that were created before this fix.
UPDATE public.profiles p
SET
  name = COALESCE(
    NULLIF(p.name, ''),
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1)
  ),
  avatar_url = COALESCE(
    p.avatar_url,
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  )
FROM auth.users u
WHERE u.id = p.id
  AND (p.name IS NULL OR p.name = '' OR p.avatar_url IS NULL);
