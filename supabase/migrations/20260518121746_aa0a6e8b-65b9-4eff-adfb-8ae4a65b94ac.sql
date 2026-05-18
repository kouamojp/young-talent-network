
-- Ad files bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-files','ad-files',true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Ad files public read" ON storage.objects;
CREATE POLICY "Ad files public read" ON storage.objects FOR SELECT USING (bucket_id = 'ad-files');

DROP POLICY IF EXISTS "Admins upload ad files" ON storage.objects;
CREATE POLICY "Admins upload ad files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ad-files' AND public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins update ad files" ON storage.objects;
CREATE POLICY "Admins update ad files" ON storage.objects FOR UPDATE USING (bucket_id = 'ad-files' AND public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins delete ad files" ON storage.objects;
CREATE POLICY "Admins delete ad files" ON storage.objects FOR DELETE USING (bucket_id = 'ad-files' AND public.has_role(auth.uid(),'admin'));

-- Counters
CREATE OR REPLACE FUNCTION public.increment_ad_view(_ad_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.advertisements SET views_count = views_count + 1 WHERE id = _ad_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_ad_click(_ad_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.advertisements SET clicks_count = clicks_count + 1 WHERE id = _ad_id;
$$;
