
-- 1) Per-user engagement on shorts (persisted across sessions)
CREATE TABLE public.short_engagements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES public.talent_media(id) ON DELETE CASCADE,
  watch_seconds NUMERIC NOT NULL DEFAULT 0,
  liked BOOLEAN NOT NULL DEFAULT false,
  passed BOOLEAN NOT NULL DEFAULT false,
  view_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, media_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.short_engagements TO authenticated;
GRANT ALL ON public.short_engagements TO service_role;
ALTER TABLE public.short_engagements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own engagement" ON public.short_engagements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_short_engagements_user ON public.short_engagements(user_id);
CREATE INDEX idx_short_engagements_media ON public.short_engagements(media_id);

-- 2) Threaded replies on media comments
ALTER TABLE public.media_comments
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.media_comments(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_media_comments_parent ON public.media_comments(parent_id);

-- 3) Likes on individual comments
CREATE TABLE public.media_comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.media_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);
GRANT SELECT ON public.media_comment_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.media_comment_likes TO authenticated;
GRANT ALL ON public.media_comment_likes TO service_role;
ALTER TABLE public.media_comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views comment likes" ON public.media_comment_likes FOR SELECT USING (true);
CREATE POLICY "Auth users like comments" ON public.media_comment_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users unlike own" ON public.media_comment_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
