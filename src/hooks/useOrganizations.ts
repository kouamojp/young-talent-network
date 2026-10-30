import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { OrganizationRowData } from '@/components/organizations/OrganizationRow';

export interface DirectoryOrganization extends OrganizationRowData {
  createdAt: string;
}

/** Organisations inscrites (table organization_profiles), les plus récentes d'abord. */
export function useOrganizations() {
  const [organizations, setOrganizations] = useState<DirectoryOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('organization_profiles')
      .select('id, company_name, industry, headquarters, logo_url, description, verified, website_url, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setOrganizations(
          (data ?? []).map((o) => ({
            id: o.id,
            name: o.company_name,
            type: o.industry ?? '',
            location: o.headquarters ?? '',
            logo: o.logo_url ?? undefined,
            description: o.description ?? '',
            verified: !!o.verified,
            website: o.website_url?.replace(/^https?:\/\//, '') || undefined,
            createdAt: o.created_at,
          })),
        );
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { organizations, loading };
}
