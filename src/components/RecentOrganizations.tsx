import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useLanguage } from '@/i18n/LanguageContext';
import { OrganizationCrest } from '@/components/organizations/OrganizationRow';

/** Les trois dernières organisations inscrites. Rien n'est affiché tant qu'il n'y en a aucune. */
const RecentOrganizations: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { organizations } = useOrganizations();
  const recent = organizations.slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building className="h-5 w-5" />
          {t('orgDisc.recentOrgs')}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/organizations')}>
          {t('common.seeAll')}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recent.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => navigate(`/organization/${org.id}`)}
              className="flex items-center gap-3 rounded-xl border border-border p-3 text-left hover:border-primary/40 transition-colors"
            >
              <OrganizationCrest name={org.name} logo={org.logo} className="h-11 w-11 text-base" />
              <span className="min-w-0">
                <span className="block truncate font-semibold text-sm">{org.name}</span>
                {org.type && <span className="block truncate text-xs text-muted-foreground">{org.type}</span>}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrganizations;
