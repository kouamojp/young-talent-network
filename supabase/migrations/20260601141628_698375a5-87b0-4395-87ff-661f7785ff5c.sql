
-- Add shares_count to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS shares_count integer NOT NULL DEFAULT 0;

-- Create post_shares table
CREATE TABLE IF NOT EXISTS public.post_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  channel text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.post_shares TO anon;
GRANT SELECT, INSERT, DELETE ON public.post_shares TO authenticated;
GRANT ALL ON public.post_shares TO service_role;

ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shares viewable by everyone" ON public.post_shares;
CREATE POLICY "Shares viewable by everyone" ON public.post_shares FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can share posts" ON public.post_shares;
CREATE POLICY "Users can share posts" ON public.post_shares FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own shares" ON public.post_shares;
CREATE POLICY "Users can delete own shares" ON public.post_shares FOR DELETE USING (auth.uid() = user_id);

-- Trigger to keep posts.shares_count in sync
CREATE OR REPLACE FUNCTION public.update_post_shares_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET shares_count = COALESCE(shares_count,0) + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET shares_count = GREATEST(COALESCE(shares_count,0) - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS trg_post_shares_count ON public.post_shares;
CREATE TRIGGER trg_post_shares_count
AFTER INSERT OR DELETE ON public.post_shares
FOR EACH ROW EXECUTE FUNCTION public.update_post_shares_count();

-- Wire likes/comments triggers (in case missing) - idempotent
DROP TRIGGER IF EXISTS trg_post_likes_count ON public.post_likes;
CREATE TRIGGER trg_post_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

DROP TRIGGER IF EXISTS trg_post_comments_count ON public.comments;
CREATE TRIGGER trg_post_comments_count
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

-- Enable realtime
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.post_likes REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.post_shares REPLICA IDENTITY FULL;

DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.posts; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.comments; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.post_shares; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
