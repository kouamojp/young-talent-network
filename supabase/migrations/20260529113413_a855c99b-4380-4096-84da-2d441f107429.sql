
CREATE TABLE IF NOT EXISTS public.media_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES public.talent_media(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (media_id, user_id)
);
GRANT SELECT ON public.media_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.media_likes TO authenticated;
GRANT ALL ON public.media_likes TO service_role;
ALTER TABLE public.media_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views media likes" ON public.media_likes FOR SELECT USING (true);
CREATE POLICY "Auth user likes" ON public.media_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth user unlikes own" ON public.media_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.media_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES public.talent_media(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_comments TO authenticated;
GRANT ALL ON public.media_comments TO service_role;
ALTER TABLE public.media_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views media comments" ON public.media_comments FOR SELECT USING (true);
CREATE POLICY "Auth user comments" ON public.media_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth user edits own comment" ON public.media_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth user deletes own comment" ON public.media_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
