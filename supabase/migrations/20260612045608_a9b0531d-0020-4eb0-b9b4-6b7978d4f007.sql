ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS external_source_url TEXT,
  ADD COLUMN IF NOT EXISTS external_source_platform TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS posts_user_external_source_url_unique
  ON public.posts (user_id, external_source_url)
  WHERE external_source_url IS NOT NULL;

ALTER TABLE public.profile_sources
  ADD COLUMN IF NOT EXISTS auto_import_posts BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS platform TEXT,
  ADD COLUMN IF NOT EXISTS last_import_at TIMESTAMPTZ;