
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_type text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS forwarded_from_id uuid;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS is_group boolean NOT NULL DEFAULT false;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS created_by uuid;

CREATE OR REPLACE FUNCTION public.create_group_conversation(_name text, _user_ids uuid[])
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _conv_id uuid;
  _current_user uuid := auth.uid();
  _uid uuid;
BEGIN
  IF _current_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO conversations (is_group, name, created_by) VALUES (true, _name, _current_user) RETURNING id INTO _conv_id;
  INSERT INTO conversation_participants (conversation_id, user_id) VALUES (_conv_id, _current_user);

  FOREACH _uid IN ARRAY _user_ids LOOP
    IF _uid <> _current_user THEN
      INSERT INTO conversation_participants (conversation_id, user_id) VALUES (_conv_id, _uid)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN _conv_id;
END;
$$;
