
CREATE TABLE public.moderation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id UUID,
  content_excerpt TEXT,
  risk_score INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'low',
  categories TEXT[] DEFAULT '{}',
  reason TEXT,
  source TEXT NOT NULL DEFAULT 'ai-assistant',
  reporter_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.moderation_reports TO authenticated;
GRANT ALL ON public.moderation_reports TO service_role;

ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all moderation reports"
  ON public.moderation_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update moderation reports"
  ON public.moderation_reports FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create reports"
  ON public.moderation_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own submitted reports"
  ON public.moderation_reports FOR SELECT
  TO authenticated
  USING (reporter_user_id = auth.uid());

CREATE TRIGGER moderation_reports_updated_at
  BEFORE UPDATE ON public.moderation_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_moderation_reports_status ON public.moderation_reports(status, created_at DESC);
CREATE INDEX idx_moderation_reports_risk ON public.moderation_reports(risk_level, created_at DESC);
