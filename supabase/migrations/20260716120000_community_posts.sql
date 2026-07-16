-- Community posts, likes and comments, plus fixes to the community membership
-- counters/policies that the Communities UI relies on.

-- ---------------------------------------------------------------------------
-- 1. community_posts
-- ---------------------------------------------------------------------------
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community posts viewable by members or public"
  ON public.community_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = community_posts.community_id
        AND (
          c.is_private = false
          OR c.creator_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.community_members m
            WHERE m.community_id = c.id AND m.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "Members can create community posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.community_members m
      WHERE m.community_id = community_posts.community_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Authors can update their community posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authors or creators can delete community posts"
  ON public.community_posts FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = community_posts.community_id AND c.creator_id = auth.uid()
    )
  );

CREATE INDEX idx_community_posts_community ON public.community_posts(community_id, created_at DESC);

CREATE TRIGGER handle_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 2. community_post_likes (+ likes_count trigger)
-- ---------------------------------------------------------------------------
CREATE TABLE public.community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community post likes viewable by everyone"
  ON public.community_post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like community posts"
  ON public.community_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike community posts"
  ON public.community_post_likes FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_community_post_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_community_post_likes_count
  AFTER INSERT OR DELETE ON public.community_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_community_post_likes_count();

-- ---------------------------------------------------------------------------
-- 3. community_post_comments (+ comments_count trigger)
-- ---------------------------------------------------------------------------
CREATE TABLE public.community_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community post comments viewable by everyone"
  ON public.community_post_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment on community posts"
  ON public.community_post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their community comments"
  ON public.community_post_comments FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_community_post_comments_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_community_post_comments_count
  AFTER INSERT OR DELETE ON public.community_post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_community_post_comments_count();

-- ---------------------------------------------------------------------------
-- 4. Fix community membership: keep members_count accurate + allow leaving
--    (the original schema had no members_count trigger and no DELETE policy,
--    so the UI could neither update the count nor let a user leave.)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_community_members_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities SET members_count = members_count + 1 WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities SET members_count = GREATEST(0, members_count - 1) WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_community_members_count
  AFTER INSERT OR DELETE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.update_community_members_count();

CREATE POLICY "Users can leave communities"
  ON public.community_members FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5. Realtime for the community feed
-- ---------------------------------------------------------------------------
ALTER TABLE public.community_posts REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
