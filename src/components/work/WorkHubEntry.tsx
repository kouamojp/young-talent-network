import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Briefcase, Building, Sparkles, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const WorkHubEntry: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">{t('work.title') || 'YAT Work'}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t('work.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="group p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-400"
          onClick={() => navigate('/work?path=organization')}
        >
          <div className="text-center">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4 transition-transform group-hover:scale-110">
              <Building className="h-12 w-12 text-blue-600 group-hover:hidden" />
              <Sparkles className="h-12 w-12 text-blue-600 hidden group-hover:block" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('work.dreamTeam')}</h3>
            <p className="text-muted-foreground mb-4">{t('work.dreamTeamDesc')}</p>
            <Button className="w-full gap-2">
              {t('work.forOrganizations')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <Card
          className="group p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-pink-400"
          onClick={() => navigate('/work?path=talent')}
        >
          <div className="text-center">
            <div className="inline-block p-4 bg-pink-100 rounded-full mb-4 transition-transform group-hover:scale-110">
              <Target className="h-12 w-12 text-pink-600 group-hover:hidden" />
              <Briefcase className="h-12 w-12 text-pink-600 hidden group-hover:block" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('work.dreamStage')}</h3>
            <p className="text-muted-foreground mb-4">{t('work.dreamStageDesc')}</p>
            <Button variant="outline" className="w-full gap-2">
              {t('work.forTalents')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkHubEntry;
