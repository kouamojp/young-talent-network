
ALTER TABLE public.talent_media DROP CONSTRAINT IF EXISTS talent_media_media_type_check;
ALTER TABLE public.talent_media ADD CONSTRAINT talent_media_media_type_check
  CHECK (media_type IN ('image','photo','video','audio','document','pdf','youtube','instagram','facebook','tiktok','link'));
ALTER TABLE public.talent_media
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS item_date DATE;

ALTER TABLE public.talent_resumes
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS idx_talent_resumes_slug ON public.talent_resumes(slug) WHERE slug IS NOT NULL;
