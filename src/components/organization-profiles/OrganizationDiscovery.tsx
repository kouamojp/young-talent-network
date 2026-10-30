import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/i18n/LanguageContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import OrganizationRow, { OrganizationCrest } from '@/components/organizations/OrganizationRow';

// Une organisation est « récente » pendant ses 30 premiers jours sur YAT.
const RECENT_MS = 30 * 24 * 60 * 60 * 1000;

const OrganizationDiscovery: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { organizations, loading } = useOrganizations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const isRecent = (createdAt: string) => Date.now() - new Date(createdAt).getTime() < RECENT_MS;
  const recentOrganizations = organizations.filter(org => isRecent(org.createdAt)).slice(0, 8);

  const query = searchTerm.toLowerCase();
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = [org.name, org.type, org.location].some(v => v.toLowerCase().includes(query));
    const matchesFilter = selectedFilter === 'all' || (selectedFilter === 'recent' && isRecent(org.createdAt)) || (selectedFilter === 'verified' && org.verified);
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { key: 'all', label: t('orgDisc.all') },
    { key: 'recent', label: t('orgDisc.recentlyAdded') },
    { key: 'verified', label: t('orgDisc.verified') },
  ];

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (organizations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <h2 className="text-lg font-semibold">Aucune organisation pour l'instant</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          Les clubs, écoles, agences et académies apparaîtront ici dès qu'ils auront créé leur profil sur YAT.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder={t('orgDisc.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} aria-label={t('orgDisc.title')} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <Button key={f.key} size="sm" variant={selectedFilter === f.key ? 'default' : 'outline'} aria-pressed={selectedFilter === f.key} onClick={() => setSelectedFilter(f.key)}>
              {f.label}
            </Button>
          ))}
          <span className="ml-auto text-sm text-muted-foreground tabular-nums">
            {filteredOrganizations.length} {filteredOrganizations.length === 1 ? t('orgDisc.organization') : t('orgDisc.organizations')}
          </span>
        </div>
      </section>

      {recentOrganizations.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">{t('orgDisc.recentOrgs')}</h2>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x [scrollbar-width:thin]">
            {recentOrganizations.map(org => (
              <button
                key={org.id}
                type="button"
                onClick={() => navigate(`/organization/${org.id}`)}
                className="snap-start shrink-0 w-[min(260px,80vw)] flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left hover:border-primary/40 transition-colors"
              >
                <OrganizationCrest name={org.name} logo={org.logo} className="h-11 w-11 text-base" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-sm">{org.name}</span>
                  {org.type && <span className="block truncate text-xs text-muted-foreground">{org.type}</span>}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">{t('orgDisc.allOrgs')}</h2>
        {filteredOrganizations.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Aucune organisation ne correspond à cette recherche.
          </p>
        ) : (
          <div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-5 divide-y divide-border">
            {filteredOrganizations.map(org => (
              <OrganizationRow key={org.id} org={org} onView={() => navigate(`/organization/${org.id}`)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default OrganizationDiscovery;
