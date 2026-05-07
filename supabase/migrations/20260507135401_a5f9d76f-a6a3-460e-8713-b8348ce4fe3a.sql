
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT '€',
  category TEXT NOT NULL DEFAULT 'Other',
  type TEXT NOT NULL DEFAULT 'product',
  location TEXT,
  media_urls TEXT[] DEFAULT '{}',
  likes_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listings viewable by everyone" ON public.marketplace_listings FOR SELECT USING (true);
CREATE POLICY "Users can create own listings" ON public.marketplace_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON public.marketplace_listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own listings" ON public.marketplace_listings FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('marketplace-files', 'marketplace-files', true);

CREATE POLICY "Anyone can view marketplace files" ON storage.objects FOR SELECT USING (bucket_id = 'marketplace-files');
CREATE POLICY "Authenticated users can upload marketplace files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'marketplace-files' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own marketplace files" ON storage.objects FOR UPDATE USING (bucket_id = 'marketplace-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own marketplace files" ON storage.objects FOR DELETE USING (bucket_id = 'marketplace-files' AND auth.uid()::text = (storage.foldername(name))[1]);
