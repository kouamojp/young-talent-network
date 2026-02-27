
-- Ratings table for user-to-user ratings
CREATE TABLE public.talent_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id uuid NOT NULL,
  rater_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(talent_id, rater_id)
);

ALTER TABLE public.talent_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings viewable by everyone" ON public.talent_ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can rate" ON public.talent_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = rater_id AND auth.uid() != talent_id);
CREATE POLICY "Users can update own ratings" ON public.talent_ratings FOR UPDATE TO authenticated USING (auth.uid() = rater_id);
CREATE POLICY "Users can delete own ratings" ON public.talent_ratings FOR DELETE TO authenticated USING (auth.uid() = rater_id);

-- Function to auto-update platform_rating on profiles
CREATE OR REPLACE FUNCTION public.update_talent_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE profiles SET
    platform_rating = COALESCE((SELECT AVG(rating)::numeric(3,1) FROM talent_ratings WHERE talent_id = COALESCE(NEW.talent_id, OLD.talent_id)), 0),
    rating_count = COALESCE((SELECT COUNT(*) FROM talent_ratings WHERE talent_id = COALESCE(NEW.talent_id, OLD.talent_id)), 0)
  WHERE id = COALESCE(NEW.talent_id, OLD.talent_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_rating_after_change
AFTER INSERT OR UPDATE OR DELETE ON public.talent_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_talent_rating();
