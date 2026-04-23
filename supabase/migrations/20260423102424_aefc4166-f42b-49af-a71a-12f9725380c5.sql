CREATE OR REPLACE FUNCTION public.create_conversation_with_participant(_other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _conv_id uuid;
  _current_user uuid := auth.uid();
  _existing_id uuid;
BEGIN
  IF _current_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _other_user_id = _current_user THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;

  -- Check for existing 1-to-1 conversation between these two users
  SELECT cp1.conversation_id INTO _existing_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = _current_user
    AND cp2.user_id = _other_user_id
  LIMIT 1;

  IF _existing_id IS NOT NULL THEN
    RETURN _existing_id;
  END IF;

  INSERT INTO conversations DEFAULT VALUES RETURNING id INTO _conv_id;

  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (_conv_id, _current_user), (_conv_id, _other_user_id);

  RETURN _conv_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_conversation_with_participant(uuid) TO authenticated;