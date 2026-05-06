
-- Restore profiles SELECT policy (was dropped by failed migration)
CREATE POLICY "Profiles viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Create secure views that hide sensitive fields from non-owners
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT
  id, name, avatar_url, sport_type, user_type, city, country, birthday,
  updated_at, created_at, bio, location, rating_count, platform_rating,
  cover_photo_url, website, category_id,
  CASE WHEN auth.uid() = id THEN email ELSE null END AS email,
  CASE WHEN auth.uid() = id THEN phone ELSE null END AS phone
FROM public.profiles;

CREATE OR REPLACE VIEW public.agent_profiles_public AS
SELECT
  id, user_id, agency_name, bio, avatar_url, location, phone, specialization,
  commission_rate, clients_represented, verified, created_at, email, website,
  deals_completed, updated_at, services, category,
  CASE WHEN auth.uid() = user_id THEN license_number ELSE null END AS license_number
FROM public.agent_profiles;

-- Tighten conversation creation - require authenticated
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Tighten conversation_participants INSERT
DROP POLICY IF EXISTS "Authenticated can add participants" ON public.conversation_participants;
CREATE POLICY "Authenticated can add participants"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR is_conversation_member(conversation_id, auth.uid())
);

-- Messages: allow users to update and delete own messages
CREATE POLICY "Users can update own messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can delete own messages"
ON public.messages
FOR DELETE
TO authenticated
USING (sender_id = auth.uid());
