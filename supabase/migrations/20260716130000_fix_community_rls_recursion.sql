-- Fix infinite recursion in community RLS policies.
--
-- The original "Members viewable by community members" policy on
-- community_members queried community_members inside its own USING clause.
-- Any evaluation of it recurses, so returning a freshly inserted community
-- (INSERT ... RETURNING, which re-checks the communities SELECT policy, which
-- references community_members) fails with a 500 "infinite recursion detected
-- in policy for relation community_members".
--
-- Fix: check membership through a SECURITY DEFINER helper that bypasses RLS,
-- so the policy no longer re-triggers itself.

CREATE OR REPLACE FUNCTION public.is_community_member(_community_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = _community_id AND user_id = _user_id
  );
$$;

-- community_members: you can always see your own membership rows, and the
-- members of any community you belong to (checked via the helper).
DROP POLICY IF EXISTS "Members viewable by community members" ON public.community_members;
CREATE POLICY "Members viewable by community members"
  ON public.community_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_community_member(community_id, auth.uid())
  );

-- communities: public communities, your own, or ones you belong to.
DROP POLICY IF EXISTS "Public communities viewable by everyone" ON public.communities;
CREATE POLICY "Public communities viewable by everyone"
  ON public.communities FOR SELECT
  USING (
    is_private = false
    OR creator_id = auth.uid()
    OR public.is_community_member(id, auth.uid())
  );

-- community_posts (only if the posts migration has been applied): replace the
-- recursive community_members subquery with the helper.
DO $$
BEGIN
  IF to_regclass('public.community_posts') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Community posts viewable by members or public" ON public.community_posts;
    CREATE POLICY "Community posts viewable by members or public"
      ON public.community_posts FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.communities c
          WHERE c.id = community_posts.community_id
            AND (
              c.is_private = false
              OR c.creator_id = auth.uid()
              OR public.is_community_member(c.id, auth.uid())
            )
        )
      );

    DROP POLICY IF EXISTS "Members can create community posts" ON public.community_posts;
    CREATE POLICY "Members can create community posts"
      ON public.community_posts FOR INSERT
      WITH CHECK (
        auth.uid() = user_id
        AND public.is_community_member(community_id, auth.uid())
      );
  END IF;
END $$;
