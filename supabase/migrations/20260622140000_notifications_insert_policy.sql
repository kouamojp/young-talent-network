-- Allow users to create notifications addressed to themselves
-- (used e.g. for missed-call notifications inserted by the recipient's own client).
CREATE POLICY "Users can create their own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
