-- Create talent_presence table to track talent visibility across platform sections
CREATE TABLE public.talent_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('events', 'tv', 'live', 'work', 'learning', 'yat-coin')),
  is_active BOOLEAN DEFAULT true,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'connections')),
  featured BOOLEAN DEFAULT false,
  bio TEXT,
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, section)
);

-- Enable RLS
ALTER TABLE public.talent_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public talent presence viewable by everyone" 
ON public.talent_presence 
FOR SELECT 
USING (visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own presence" 
ON public.talent_presence 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presence" 
ON public.talent_presence 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presence" 
ON public.talent_presence 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_talent_presence_updated_at
BEFORE UPDATE ON public.talent_presence
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create talent presence on profile creation
CREATE OR REPLACE FUNCTION public.create_talent_presence()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create presence for talent users
  IF NEW.user_type = 'talent' THEN
    INSERT INTO public.talent_presence (user_id, section) VALUES
      (NEW.id, 'events'),
      (NEW.id, 'tv'),
      (NEW.id, 'live'),
      (NEW.id, 'work'),
      (NEW.id, 'learning'),
      (NEW.id, 'yat-coin');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create presence when profile is created
CREATE TRIGGER on_profile_created_create_presence
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_talent_presence();