-- 1. Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS professional_title text,
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS talent_level text,
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS about_me text;

-- 2. Extend talent_achievements
ALTER TABLE public.talent_achievements
  ADD COLUMN IF NOT EXISTS achievement_type text,
  ADD COLUMN IF NOT EXISTS external_link text;

-- 3. New table: talent_experiences
CREATE TABLE IF NOT EXISTS public.talent_experiences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  organization text,
  country text,
  city text,
  start_date date,
  end_date date,
  is_current boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.talent_experiences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.talent_experiences TO authenticated;
GRANT ALL ON public.talent_experiences TO service_role;

ALTER TABLE public.talent_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experiences viewable by everyone"
  ON public.talent_experiences FOR SELECT USING (true);

CREATE POLICY "Users can create own experiences"
  ON public.talent_experiences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiences"
  ON public.talent_experiences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiences"
  ON public.talent_experiences FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_talent_experiences_updated_at
  BEFORE UPDATE ON public.talent_experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_talent_experiences_user ON public.talent_experiences(user_id);