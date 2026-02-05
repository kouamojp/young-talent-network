-- Add 'karta' to the section check constraint and update the auto-creation function

-- First, drop the existing check constraint and add a new one with 'karta'
ALTER TABLE public.talent_presence DROP CONSTRAINT IF EXISTS talent_presence_section_check;
ALTER TABLE public.talent_presence ADD CONSTRAINT talent_presence_section_check 
  CHECK (section IN ('events', 'tv', 'live', 'work', 'learning', 'yat-coin', 'karta'));

-- Update the function to include 'karta' section
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
      (NEW.id, 'yat-coin'),
      (NEW.id, 'karta');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;