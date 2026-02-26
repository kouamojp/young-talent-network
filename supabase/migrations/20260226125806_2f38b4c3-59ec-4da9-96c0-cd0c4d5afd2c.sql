
-- Storage bucket for profile uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-files', 'profile-files', true);

-- Storage RLS policies
CREATE POLICY "Anyone can view profile files" ON storage.objects FOR SELECT USING (bucket_id = 'profile-files');
CREATE POLICY "Authenticated users can upload profile files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-files' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile files" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own profile files" ON storage.objects FOR DELETE USING (bucket_id = 'profile-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Education table
CREATE TABLE public.talent_education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  institution TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_year INTEGER,
  end_year INTEGER,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  education_type TEXT NOT NULL DEFAULT 'school',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.talent_education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Education viewable by everyone" ON public.talent_education FOR SELECT USING (true);
CREATE POLICY "Users can manage own education" ON public.talent_education FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own education" ON public.talent_education FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own education" ON public.talent_education FOR DELETE USING (auth.uid() = user_id);

-- Platform rating column on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS platform_rating NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
