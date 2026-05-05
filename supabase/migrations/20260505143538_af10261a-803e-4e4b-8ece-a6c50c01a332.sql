
CREATE TABLE public.profile_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'other' CHECK (source_type IN ('social', 'portfolio', 'sports_db', 'other')),
  label TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'synced', 'error')),
  error_message TEXT,
  auto_sync BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sources" ON public.profile_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sources" ON public.profile_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sources" ON public.profile_sources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sources" ON public.profile_sources FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_profile_sources_updated_at
  BEFORE UPDATE ON public.profile_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
