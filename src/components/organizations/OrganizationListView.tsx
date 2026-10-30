import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useLanguage } from '@/i18n/LanguageContext';
import OrganizationRow from './OrganizationRow';

const ALL = '__all__';

/** Annuaire complet, filtrable par secteur. Les secteurs viennent des organisations inscrites. */
const OrganizationListView: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { organizations, loading } = useOrganizations();
  const [industry, setIndustry] = useState(ALL);

  const industries = useMemo(
    () => [...new Set(organizations.map(o => o.type).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [organizations],
  );
  const filtered = industry === ALL ? organizations : organizations.filter(o => o.type === industry);

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (organizations.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Aucune organisation inscrite pour l'instant.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {industries.length > 1 && (
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger className="w-full sm:w-64" aria-label="Secteur">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les secteurs</SelectItem>
            {industries.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      <div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-5 divide-y divide-border">
        {filtered.map(org => (
          <OrganizationRow key={org.id} org={org} onView={() => navigate(`/organization/${org.id}`)} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground tabular-nums">
        {filtered.length} {filtered.length === 1 ? t('orgDisc.organization') : t('orgDisc.organizations')}
      </p>
    </div>
  );
};

export default OrganizationListView;
