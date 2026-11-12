-- Stores each completed aptitude test so results survive a page reload and
-- can be shown on the user's profile.
CREATE TABLE IF NOT EXISTS public.aptitude_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  results jsonb NOT NULL,
  top_area text,
  top_score integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS aptitude_test_results_user_idx
  ON public.aptitude_test_results (user_id, created_at DESC);

ALTER TABLE public.aptitude_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own aptitude results"
  ON public.aptitude_test_results FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can save their own aptitude results"
  ON public.aptitude_test_results FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own aptitude results"
  ON public.aptitude_test_results FOR DELETE TO authenticated
  USING (user_id = auth.uid());
