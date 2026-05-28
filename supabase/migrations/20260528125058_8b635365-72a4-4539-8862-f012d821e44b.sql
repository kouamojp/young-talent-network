-- Sport-specific detailed profile
CREATE TABLE public.talent_sport_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sport TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, sport)
);

GRANT SELECT ON public.talent_sport_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.talent_sport_profiles TO authenticated;
GRANT ALL ON public.talent_sport_profiles TO service_role;

ALTER TABLE public.talent_sport_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public sport profiles viewable by everyone"
  ON public.talent_sport_profiles FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users insert own sport profile"
  ON public.talent_sport_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own sport profile"
  ON public.talent_sport_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own sport profile"
  ON public.talent_sport_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_talent_sport_profiles_updated_at
  BEFORE UPDATE ON public.talent_sport_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable cron for periodic source re-sync
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;