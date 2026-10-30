import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Briefcase, Users, Building, TrendingUp, ArrowUpRight, FileText, Sparkles, Target } from 'lucide-react';
import GlassMorphism from '@/components/GlassMorphism';
import WorkHubEntry from '@/components/work/WorkHubEntry';
import TalentView from '@/components/work/TalentView';
import OrganizationView from '@/components/work/OrganizationView';
import SearchHeader from '@/components/work/SearchHeader';
import TalentSearchCards from '@/components/TalentSearchCards';
import SuccessStories from '@/components/work/SuccessStories';
import WorkAIPanel from '@/components/work/WorkAIPanel';
import { useLanguage } from '@/i18n/LanguageContext';

const Work: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('path') || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('opportunities');
  const [viewMode, setViewMode] = useState<'resumes' | 'jobs'>('jobs');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (path === 'talent') {
      setSelectedTab('opportunities');
      setViewMode('jobs');
    } else if (path === 'organization') {
      setSelectedTab('talents');
      setViewMode('resumes');
    }
  }, [path]);

  const handleBack = () => setSearchParams({});
  const handleApplyClick = (e: React.MouseEvent) => { e.stopPropagation(); };
  const handleCardClick = (id: number) => { console.log('Card clicked:', id); };

  const stats = [
    { label: t('work.openOpportunities') || 'Open Opportunities', value: '1,280+', icon: Briefcase, change: '+96' },
    { label: t('work.activeTalents') || 'Active Talents', value: '4,650', icon: Users, change: '+312' },
    { label: t('work.organizations') || 'Organizations', value: '215', icon: Building, change: '+18' },
    { label: t('work.successRate') || 'Hire Success', value: '88%', icon: TrendingUp, change: '+2.4%' },
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
                {path === 'talent' ? (
                  <TalentView
                    selectedTab={selectedTab}
                    onTabChange={setSelectedTab}
                    handleApplyClick={handleApplyClick}
                    handleCardClick={handleCardClick}
                  />
                ) : (
                  <OrganizationView
                    selectedTab={selectedTab}
                    onTabChange={setSelectedTab}
                    handleApplyClick={handleApplyClick}
                    handleCardClick={handleCardClick}
                  />
                )}
              </TabsContent>

              <TabsContent value="resumes">
                <TalentSearchCards />
              </TabsContent>
            </Tabs>
          </GlassMorphism>

          <GlassMorphism className="p-6">
            <h2 className="text-xl font-bold mb-4">{t('work.successStories')}</h2>
            <SuccessStories />
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

          <dl className="grid grid-cols-2 md:grid-cols-4 mb-8 border-y border-border">
            {stats.map((s, i) => (
              <div key={i} className={`py-4 ${i % 2 === 1 ? 'pl-4 border-l border-border' : ''} ${i >= 1 ? 'md:pl-5 md:border-l md:border-border' : ''} ${i >= 2 ? 'border-t border-border md:border-t-0' : ''}`}>
                <dt className="text-sm text-muted-foreground">{s.label}</dt>
                <dd className="mt-1 font-display text-2xl md:text-3xl font-semibold tabular-nums leading-none">{s.value}</dd>
                <dd className="mt-1.5 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-xs tabular-nums">{s.change}</span>
                </dd>
              </div>
            ))}
          </dl>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">{t('work.overview')}</TabsTrigger>
              <TabsTrigger value="opportunities">{t('work.opportunitiesTab')}</TabsTrigger>
              <TabsTrigger value="stories">{t('work.storiesTab')}</TabsTrigger>
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

            <TabsContent value="stories" className="mt-6">
              <SuccessStories />
            </TabsContent>
          </Tabs>
        </GlassMorphism>
      </main>
    </div>
  );
};

export default Work;
