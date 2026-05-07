
-- Add scheduled publishing to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS scheduled_for timestamptz DEFAULT NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

-- Drop and recreate the select policy to hide unpublished scheduled posts
DROP POLICY IF EXISTS "Posts visibility access" ON public.posts;
CREATE POLICY "Posts visibility access" ON public.posts FOR SELECT USING (
  is_published = true AND (
    (visibility = 'public') OR
    (auth.uid() = user_id) OR
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM connections
      WHERE status = 'accepted'
        AND ((user_id = auth.uid() AND connected_user_id = posts.user_id)
          OR (connected_user_id = auth.uid() AND user_id = posts.user_id))
    )) OR
    (visibility = 'link')
  )
  OR (is_published = false AND auth.uid() = user_id)
);

-- Stories table
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  media_url text,
  text_overlay text,
  background_color text DEFAULT '#1a1a2e',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  views_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stories viewable by everyone" ON public.stories
  FOR SELECT USING (expires_at > now());

CREATE POLICY "Users can create stories" ON public.stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" ON public.stories
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" ON public.stories
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for efficient expiry queries
CREATE INDEX idx_stories_expires_at ON public.stories (expires_at);
CREATE INDEX idx_posts_scheduled ON public.posts (scheduled_for) WHERE is_published = false;
