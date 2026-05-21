
-- Linked accounts: up to 3 per owner, with selectable sync fields
CREATE TABLE IF NOT EXISTS public.account_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  linked_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  sync_fields text[] NOT NULL DEFAULT ARRAY['name','avatar_url','bio','city','country','phone','website']::text[],
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(owner_user_id, linked_user_id),
  CHECK (owner_user_id <> linked_user_id),
  CHECK (status IN ('pending','accepted','rejected'))
);

ALTER TABLE public.account_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view links"
  ON public.account_links FOR SELECT
  USING (auth.uid() = owner_user_id OR auth.uid() = linked_user_id);

CREATE POLICY "Owner can create link"
  ON public.account_links FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Parties can update link"
  ON public.account_links FOR UPDATE
  USING (auth.uid() = owner_user_id OR auth.uid() = linked_user_id);

CREATE POLICY "Parties can delete link"
  ON public.account_links FOR DELETE
  USING (auth.uid() = owner_user_id OR auth.uid() = linked_user_id);

-- Enforce max 3 links per owner
CREATE OR REPLACE FUNCTION public.enforce_account_links_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.account_links WHERE owner_user_id = NEW.owner_user_id) >= 3 THEN
    RAISE EXCEPTION 'Maximum 3 linked accounts allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS account_links_limit_trg ON public.account_links;
CREATE TRIGGER account_links_limit_trg
  BEFORE INSERT ON public.account_links
  FOR EACH ROW EXECUTE FUNCTION public.enforce_account_links_limit();

DROP TRIGGER IF EXISTS account_links_updated_at ON public.account_links;
CREATE TRIGGER account_links_updated_at
  BEFORE UPDATE ON public.account_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
