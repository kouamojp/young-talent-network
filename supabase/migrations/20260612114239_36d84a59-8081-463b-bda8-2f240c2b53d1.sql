ALTER TABLE public.talent_media REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.talent_media;