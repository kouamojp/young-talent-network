import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Building, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const WorkHubEntry: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">{t('work.title') || 'YAT Work'}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t('work.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="p-6 transition-colors cursor-pointer hover:border-primary/40"
          onClick={() => navigate('/work?path=organization')}
        >
          <div className="text-center">
            <div className="inline-flex p-4 bg-accent rounded-full mb-4">
              <Building className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('work.dreamTeam')}</h3>
            <p className="text-muted-foreground mb-4">{t('work.dreamTeamDesc')}</p>
            <Button className="w-full gap-2">
              {t('work.forOrganizations')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <Card
          className="p-6 transition-colors cursor-pointer hover:border-primary/40"
          onClick={() => navigate('/work?path=talent')}
        >
          <div className="text-center">
            <div className="inline-flex p-4 bg-muted rounded-full mb-4">
              <Target className="h-10 w-10 text-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('work.dreamStage')}</h3>
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
