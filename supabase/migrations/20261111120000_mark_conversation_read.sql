-- Allow a conversation member to mark the messages they received as read.
-- The messages UPDATE policy only lets senders edit their own messages, so
-- recipients need this SECURITY DEFINER function to flip the `read` flag.
CREATE OR REPLACE FUNCTION public.mark_conversation_read(_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_conversation_member(_conversation_id, auth.uid()) THEN
    RAISE EXCEPTION 'not a member of this conversation';
  END IF;

  UPDATE public.messages
  SET read = true
  WHERE conversation_id = _conversation_id
    AND sender_id <> auth.uid()
    AND read = false;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_conversation_read(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(uuid) TO authenticated;
