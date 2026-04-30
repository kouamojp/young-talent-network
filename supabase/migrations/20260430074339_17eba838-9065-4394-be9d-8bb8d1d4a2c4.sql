-- Add scheduled_for column to drafts for scheduled publication
ALTER TABLE public.post_drafts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- Enable realtime on like/comment tables for live counters
ALTER TABLE public.page_likes REPLICA IDENTITY FULL;
ALTER TABLE public.page_comments REPLICA IDENTITY FULL;
ALTER TABLE public.user_pages REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.page_likes;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.page_comments;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_pages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;