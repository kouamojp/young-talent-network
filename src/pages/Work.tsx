import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Briefcase, FileText, Sparkles, Target } from 'lucide-react';
import { usePlatformCounts, formatCount } from '@/hooks/usePlatformCounts';
import GlassMorphism from '@/components/GlassMorphism';
import WorkHubEntry from '@/components/work/WorkHubEntry';
import TalentView from '@/components/work/TalentView';
import OrganizationView from '@/components/work/OrganizationView';
import SearchHeader from '@/components/work/SearchHeader';
import TalentSearchCards from '@/components/TalentSearchCards';
import WorkAIPanel from '@/components/work/WorkAIPanel';
import { useLanguage } from '@/i18n/LanguageContext';

const Work: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('path') || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'resumes' | 'jobs'>('jobs');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (path === 'talent') {
      setViewMode('jobs');
    } else if (path === 'organization') {
      setViewMode('resumes');
    }
  }, [path]);

  const handleBack = () => setSearchParams({});

  const counts = usePlatformCounts();
  const stats = [
    { label: t('work.openOpportunities'), value: formatCount(counts?.openJobs) },
    { label: t('work.activeTalents'), value: formatCount(counts?.talents) },
    { label: t('work.organizations'), value: formatCount(counts?.organizations) },
  ];

  // Detail views
  if (path === 'talent' || path === 'organization') {
    return (
      <div className="min-h-screen">
        <main className="max-w-5xl mx-auto px-4 py-6">
          <GlassMorphism className="p-6 mb-6">
            <SearchHeader
              path={path}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onBack={handleBack}
            />

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'jobs' | 'resumes')}>
              <TabsList className="mb-6 w-full md:w-auto">
                <TabsTrigger value="jobs" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{t('work.jobOpenings')}</span>
                </TabsTrigger>
                <TabsTrigger value="resumes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{t('work.resumes')}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jobs">
                {path === 'talent' ? <TalentView searchTerm={searchTerm} /> : <OrganizationView searchTerm={searchTerm} />}
              </TabsContent>

              <TabsContent value="resumes">
                <TalentSearchCards />
              </TabsContent>
            </Tabs>
          </GlassMorphism>
        </main>
      </div>
    );
  }

  // Hub overview
  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-6">
        <GlassMorphism className="p-6">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold">
                  {t('work.title') || 'YAT Work'}
                </h1>
                <p className="text-muted-foreground">{t('work.subtitle')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setSearchParams({ path: 'talent' })}>
                {t('work.findOpportunities')}
              </Button>
              <Button variant="outline" onClick={() => setSearchParams({ path: 'organization' })}>
                {t('work.findTalents')}
              </Button>
            </div>
          </div>

          <dl className="grid grid-cols-3 mb-8 border-y border-border">
            {stats.map((s, i) => (
              <div key={i} className={`py-4 min-w-0 ${i >= 1 ? 'pl-3 sm:pl-5 border-l border-border' : ''}`}>
                <dt className="text-xs sm:text-sm text-muted-foreground">{s.label}</dt>
                <dd className="mt-1 font-display text-2xl md:text-3xl font-semibold tabular-nums leading-none">{s.value}</dd>
              </div>
            ))}
          </dl>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">{t('work.overview')}</TabsTrigger>
              <TabsTrigger value="opportunities">{t('work.opportunitiesTab')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <WorkAIPanel />
              <WorkHubEntry />
            </TabsContent>

            <TabsContent value="opportunities" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                  className="p-6 hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => setSearchParams({ path: 'talent' })}
                >
                  <div className="text-center">
                    <div className="inline-flex p-4 bg-accent rounded-full mb-4">
                      <Target className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t('work.dreamStage')}</h3>
                    <p className="text-muted-foreground mb-4">{t('work.dreamStageDesc')}</p>
                    <Button className="w-full">{t('work.forTalents')}</Button>
                  </div>
                </Card>
                <Card
                  className="p-6 hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => setSearchParams({ path: 'organization' })}
                >
                  <div className="text-center">
                    <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                      <Sparkles className="h-10 w-10 text-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t('work.dreamTeam')}</h3>
                    <p className="text-muted-foreground mb-4">{t('work.dreamTeamDesc')}</p>
                    <Button variant="outline" className="w-full">{t('work.forOrganizations')}</Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </GlassMorphism>
      </main>
    </div>
  );
};

export default Work;
