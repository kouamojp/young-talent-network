
-- Create SECURITY DEFINER function to check conversation membership
CREATE OR REPLACE FUNCTION public.is_conversation_member(_conversation_id uuid, _user_id uuid)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conversation_id AND user_id = _user_id
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_conversation_member FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_conversation_member TO authenticated;

-- Drop all existing conversation_participants policies
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can leave conversations" ON public.conversation_participants;

-- Recreate with non-recursive policies
CREATE POLICY "Users can view participants"
ON public.conversation_participants FOR SELECT TO authenticated
USING (public.is_conversation_member(conversation_id, auth.uid()));

CREATE POLICY "Authenticated can add participants"
ON public.conversation_participants FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can leave conversations"
ON public.conversation_participants FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Also fix conversations SELECT policy which depends on conversation_participants
DROP POLICY IF EXISTS "Users can view conversations they're part of" ON public.conversations;
CREATE POLICY "Users can view conversations they're part of"
ON public.conversations FOR SELECT TO authenticated
USING (public.is_conversation_member(id, auth.uid()));

DROP POLICY IF EXISTS "Users can update conversations they're part of" ON public.conversations;
CREATE POLICY "Users can update conversations they're part of"
ON public.conversations FOR UPDATE TO authenticated
USING (public.is_conversation_member(id, auth.uid()));

-- Fix messages SELECT policy similarly
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT TO authenticated
USING (public.is_conversation_member(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "Users can send messages to their conversations"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid() AND public.is_conversation_member(conversation_id, auth.uid()));
