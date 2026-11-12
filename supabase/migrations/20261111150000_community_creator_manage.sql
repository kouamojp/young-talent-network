-- Community creators can edit and delete their own community.
-- Until now only platform admins had UPDATE/DELETE rights on communities.
DROP POLICY IF EXISTS "Creators can update their community" ON public.communities;
CREATE POLICY "Creators can update their community"
  ON public.communities FOR UPDATE TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

DROP POLICY IF EXISTS "Creators can delete their community" ON public.communities;
CREATE POLICY "Creators can delete their community"
  ON public.communities FOR DELETE TO authenticated
  USING (creator_id = auth.uid());
