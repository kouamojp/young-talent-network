
-- Table: Agent-Talent Contracts (partenariat mutuel)
CREATE TABLE public.agent_talent_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  talent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  commission_rate numeric,
  contract_duration_months integer,
  start_date date,
  end_date date,
  terms text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agent_id, talent_id)
);

ALTER TABLE public.agent_talent_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contracts viewable by parties" ON public.agent_talent_contracts
  FOR SELECT USING (auth.uid() = agent_id OR auth.uid() = talent_id);

CREATE POLICY "Agents can create contracts" ON public.agent_talent_contracts
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Parties can update contracts" ON public.agent_talent_contracts
  FOR UPDATE USING (auth.uid() = agent_id OR auth.uid() = talent_id);

CREATE POLICY "Parties can delete contracts" ON public.agent_talent_contracts
  FOR DELETE USING (auth.uid() = agent_id OR auth.uid() = talent_id);

-- Table: Agent-Organization Memberships
CREATE TABLE public.agent_organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organization_profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  status text NOT NULL DEFAULT 'pending',
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agent_id, organization_id)
);

ALTER TABLE public.agent_organization_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Memberships viewable by everyone" ON public.agent_organization_memberships
  FOR SELECT USING (true);

CREATE POLICY "Agents can request membership" ON public.agent_organization_memberships
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Parties can update membership" ON public.agent_organization_memberships
  FOR UPDATE USING (
    auth.uid() = agent_id OR 
    EXISTS (SELECT 1 FROM public.organization_profiles WHERE id = organization_id AND user_id = auth.uid())
  );

CREATE POLICY "Parties can delete membership" ON public.agent_organization_memberships
  FOR DELETE USING (
    auth.uid() = agent_id OR 
    EXISTS (SELECT 1 FROM public.organization_profiles WHERE id = organization_id AND user_id = auth.uid())
  );

-- Add services column to agent_profiles
ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS services text[] DEFAULT '{}';
ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS deals_completed integer DEFAULT 0;

-- Enable realtime for contracts
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_talent_contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_organization_memberships;

-- Trigger for updated_at
CREATE TRIGGER update_agent_talent_contracts_updated_at
  BEFORE UPDATE ON public.agent_talent_contracts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_agent_org_memberships_updated_at
  BEFORE UPDATE ON public.agent_organization_memberships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
