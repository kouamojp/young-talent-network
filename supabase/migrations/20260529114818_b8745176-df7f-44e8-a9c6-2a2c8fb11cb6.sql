
CREATE TABLE public.story_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_story_comments_story_created ON public.story_comments(story_id, created_at DESC);

GRANT SELECT ON public.story_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_comments TO authenticated;
GRANT ALL ON public.story_comments TO service_role;

ALTER TABLE public.story_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
ON public.story_comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can comment"
ON public.story_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.story_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.story_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
