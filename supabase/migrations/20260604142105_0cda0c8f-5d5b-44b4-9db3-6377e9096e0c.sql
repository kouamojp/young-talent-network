
-- VERIFICATION REQUESTS
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('talent','agent','organization','recruiter','mentor','sponsor')),
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  official_links TEXT[] DEFAULT '{}',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','info_requested')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.verification_requests TO authenticated;
GRANT ALL ON public.verification_requests TO service_role;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own verification requests"
  ON public.verification_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create their own verification requests"
  ON public.verification_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own pending requests"
  ON public.verification_requests FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id AND status IN ('pending','info_requested')) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PROFILE BADGES (verification badges)
CREATE TABLE public.profile_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('talent','agent','organization','recruiter','mentor','sponsor')),
  granted_by UUID REFERENCES auth.users(id),
  request_id UUID REFERENCES public.verification_requests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_type)
);

GRANT SELECT ON public.profile_badges TO anon, authenticated;
GRANT ALL ON public.profile_badges TO service_role;
ALTER TABLE public.profile_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profile badges"
  ON public.profile_badges FOR SELECT
  USING (true);

CREATE POLICY "Admins manage profile badges"
  ON public.profile_badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- TALENT REQUESTS (marketplace de talents)
CREATE TABLE public.talent_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('recruitment','collaboration','sponsoring','training','event','freelance','sport_trial','casting')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  domain TEXT,
  country TEXT,
  city TEXT,
  budget TEXT,
  deadline DATE,
  conditions TEXT,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','draft')),
  views_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.talent_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.talent_requests TO authenticated;
GRANT ALL ON public.talent_requests TO service_role;
ALTER TABLE public.talent_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open talent requests"
  ON public.talent_requests FOR SELECT
  USING (status = 'open' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users create requests"
  ON public.talent_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors update their requests"
  ON public.talent_requests FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authors delete their requests"
  ON public.talent_requests FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_talent_requests_updated_at
  BEFORE UPDATE ON public.talent_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TALENT REQUEST APPLICATIONS
CREATE TABLE public.talent_request_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.talent_requests(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, applicant_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.talent_request_applications TO authenticated;
GRANT ALL ON public.talent_request_applications TO service_role;
ALTER TABLE public.talent_request_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applicants and request owners view applications"
  ON public.talent_request_applications FOR SELECT TO authenticated
  USING (
    auth.uid() = applicant_id
    OR EXISTS (SELECT 1 FROM public.talent_requests r WHERE r.id = request_id AND r.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users create their own applications"
  ON public.talent_request_applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Applicants update or withdraw their applications"
  ON public.talent_request_applications FOR UPDATE TO authenticated
  USING (
    auth.uid() = applicant_id
    OR EXISTS (SELECT 1 FROM public.talent_requests r WHERE r.id = request_id AND r.user_id = auth.uid())
  );

CREATE TRIGGER update_tra_updated_at
  BEFORE UPDATE ON public.talent_request_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SAVED PROFILES
CREATE TABLE public.saved_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, saved_user_id)
);

GRANT SELECT, INSERT, DELETE ON public.saved_profiles TO authenticated;
GRANT ALL ON public.saved_profiles TO service_role;
ALTER TABLE public.saved_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own saved profiles"
  ON public.saved_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Helper: auto-grant badge when verification approved
CREATE OR REPLACE FUNCTION public.handle_verification_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.profile_badges (user_id, badge_type, granted_by, request_id)
    VALUES (NEW.user_id, NEW.badge_type, NEW.reviewed_by, NEW.id)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_verification_approved
  AFTER UPDATE ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_verification_approved();
