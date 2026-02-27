
ALTER TABLE public.talent_ratings
  ADD CONSTRAINT talent_ratings_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT talent_ratings_rater_id_fkey FOREIGN KEY (rater_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
