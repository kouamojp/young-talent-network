import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import OrganizationListView from '@/components/organizations/OrganizationListView';
import OrganizationDiscovery from '@/components/organization-profiles/OrganizationDiscovery';
import { useLanguage } from '@/i18n/LanguageContext';

const Organizations: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <header className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold">{t('orgs.title')}</h1>
            <p className="mt-1 text-muted-foreground">{t('landing.orgsDesc')}</p>
          </div>
          {/* Les organisations s'inscrivent par la vraie inscription, profil « Organisation » */}
          <Button variant="outline" onClick={() => navigate('/auth')}>
            <Building className="h-4 w-4" />
            {t('orgs.joinLogin')}
          </Button>
        </header>

        <Tabs defaultValue="discovery">
          <TabsList className="mb-6">
            <TabsTrigger value="discovery">{t('orgs.discovery')}</TabsTrigger>
            <TabsTrigger value="browse">{t('orgs.browseAll')}</TabsTrigger>
          </TabsList>
          <TabsContent value="discovery"><OrganizationDiscovery /></TabsContent>
          <TabsContent value="browse"><OrganizationListView /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Organizations;
