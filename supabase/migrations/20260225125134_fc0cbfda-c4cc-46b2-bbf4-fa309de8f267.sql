
-- Categories table (Sport, Art, Science, Fashion, Medicine, Dance, Music, Hobby)
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_fr TEXT,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by everyone" ON public.categories
  FOR SELECT USING (true);

-- Talent resumes (multiple resumes per talent for different activities)
CREATE TABLE public.talent_resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  description TEXT,
  experience TEXT,
  achievements TEXT[] DEFAULT '{}',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.talent_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resumes viewable by everyone" ON public.talent_resumes FOR SELECT USING (true);
CREATE POLICY "Users can manage own resumes" ON public.talent_resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON public.talent_resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON public.talent_resumes FOR DELETE USING (auth.uid() = user_id);

-- Talent media (photos, videos)
CREATE TABLE public.talent_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'youtube')),
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.talent_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media viewable by everyone" ON public.talent_media FOR SELECT USING (true);
CREATE POLICY "Users can manage own media" ON public.talent_media FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own media" ON public.talent_media FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own media" ON public.talent_media FOR DELETE USING (auth.uid() = user_id);

-- Talent achievements
CREATE TABLE public.talent_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  category TEXT,
  level TEXT CHECK (level IN ('local', 'regional', 'national', 'international')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.talent_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements viewable by everyone" ON public.talent_achievements FOR SELECT USING (true);
CREATE POLICY "Users can manage own achievements" ON public.talent_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON public.talent_achievements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own achievements" ON public.talent_achievements FOR DELETE USING (auth.uid() = user_id);

-- Social links table
CREATE TABLE public.talent_social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.talent_social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Social links viewable by everyone" ON public.talent_social_links FOR SELECT USING (true);
CREATE POLICY "Users can manage own links" ON public.talent_social_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own links" ON public.talent_social_links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own links" ON public.talent_social_links FOR DELETE USING (auth.uid() = user_id);

-- Add additional fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS sport_type TEXT,
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id),
  ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update user type to support agent
-- (user_type is already text, so it supports 'talent', 'organization', 'agent')

-- Insert default categories from the document
INSERT INTO public.categories (name, name_fr, icon) VALUES
  ('sport', 'Sport', 'trophy'),
  ('art', 'Art', 'palette'),
  ('science', 'Science', 'flask-conical'),
  ('fashion', 'Mode', 'shirt'),
  ('medicine', 'Médecine', 'heart-pulse'),
  ('dance', 'Danse', 'music'),
  ('music', 'Musique', 'music-2'),
  ('hobby', 'Hobby', 'star');

-- Update trigger to handle agent user type
CREATE OR REPLACE FUNCTION public.create_talent_presence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.user_type = 'talent' OR NEW.user_type = 'agent' THEN
    INSERT INTO public.talent_presence (user_id, section) VALUES
      (NEW.id, 'events'),
      (NEW.id, 'tv'),
      (NEW.id, 'live'),
      (NEW.id, 'work'),
      (NEW.id, 'learning'),
      (NEW.id, 'yat-coin'),
      (NEW.id, 'karta');
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_profile_created_create_presence ON public.profiles;
CREATE TRIGGER on_profile_created_create_presence
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_talent_presence();
