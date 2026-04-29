-- Add visibility + share_token to posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS share_token text UNIQUE;

-- Add visibility + share_token + counters to user_pages (articles)
ALTER TABLE public.user_pages
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS share_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count integer NOT NULL DEFAULT 0;

-- Update visibility for user_pages select policy (friends)
DROP POLICY IF EXISTS "Public pages viewable by everyone" ON public.user_pages;
CREATE POLICY "Pages visibility access"
ON public.user_pages
FOR SELECT
USING (
  visibility = 'public'
  OR auth.uid() = user_id
  OR (visibility = 'friends' AND EXISTS (
    SELECT 1 FROM public.connections
    WHERE status = 'accepted'
      AND ((user_id = auth.uid() AND connected_user_id = user_pages.user_id)
        OR (connected_user_id = auth.uid() AND user_id = user_pages.user_id))
  ))
);

-- Update posts SELECT policy similarly (drop existing public-everyone if present)
DROP POLICY IF EXISTS "Posts viewable by everyone" ON public.posts;
CREATE POLICY "Posts visibility access"
ON public.posts
FOR SELECT
USING (
  visibility = 'public'
  OR auth.uid() = user_id
  OR (visibility = 'friends' AND EXISTS (
    SELECT 1 FROM public.connections
    WHERE status = 'accepted'
      AND ((user_id = auth.uid() AND connected_user_id = posts.user_id)
        OR (connected_user_id = auth.uid() AND user_id = posts.user_id))
  ))
  OR visibility = 'link'
);

-- Drafts table
CREATE TABLE IF NOT EXISTS public.post_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  draft_type text NOT NULL DEFAULT 'post',
  title text,
  content text,
  category text,
  visibility text NOT NULL DEFAULT 'public',
  media_urls text[],
  poll_question text,
  poll_options text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.post_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own drafts" ON public.post_drafts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own drafts" ON public.post_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own drafts" ON public.post_drafts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own drafts" ON public.post_drafts FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_post_drafts_updated_at
BEFORE UPDATE ON public.post_drafts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Page likes
CREATE TABLE IF NOT EXISTS public.page_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_id, user_id)
);
ALTER TABLE public.page_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Page likes viewable by everyone" ON public.page_likes FOR SELECT USING (true);
CREATE POLICY "Users can like pages" ON public.page_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike pages" ON public.page_likes FOR DELETE USING (auth.uid() = user_id);

-- Page comments
CREATE TABLE IF NOT EXISTS public.page_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.page_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Page comments viewable by everyone" ON public.page_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment on pages" ON public.page_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own page comments" ON public.page_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own page comments" ON public.page_comments FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_page_comments_updated_at
BEFORE UPDATE ON public.page_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Counter triggers for page_likes
CREATE OR REPLACE FUNCTION public.update_page_likes_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_pages SET likes_count = likes_count + 1 WHERE id = NEW.page_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_pages SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.page_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER trg_page_likes_count
AFTER INSERT OR DELETE ON public.page_likes
FOR EACH ROW EXECUTE FUNCTION public.update_page_likes_count();

CREATE OR REPLACE FUNCTION public.update_page_comments_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_pages SET comments_count = comments_count + 1 WHERE id = NEW.page_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_pages SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.page_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER trg_page_comments_count
AFTER INSERT OR DELETE ON public.page_comments
FOR EACH ROW EXECUTE FUNCTION public.update_page_comments_count();