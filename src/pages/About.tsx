import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, GraduationCap, Map, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tr } from '@/i18n';

const PILLARS = [
  { icon: Sparkles, title: tr('about.showYourTalent'), text: tr('about.aCompleteProfileWithMediaPublic') },
  { icon: Users, title: tr('common.connect2'), text: tr('about.newsFeedCommunitiesMessagingAndCalls') },
  { icon: Briefcase, title: tr('work.findOpportunities'), text: tr('about.jobOffersTalentRequestsContractsWith') },
  { icon: GraduationCap, title: tr('about.grow'), text: tr('about.coursesAndTrainingAptitudeTestEvents') },
  { icon: Map, title: tr('about.exploreAroundYou'), text: tr('about.yatKartaPutsTalentsOffersEvents') },
  { icon: ShieldCheck, title: tr('about.safely'), text: tr('about.signUpFromAge13Parental') },
];

/** Page « À propos » de Young & Talented. */
const About: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
    <header className="space-y-3 max-w-2xl">
      <p className="text-sm font-medium text-primary">{tr('footer.about')}</p>
      <h1 className="text-3xl md:text-4xl font-bold">{tr('auth.title')}</h1>
      <p className="text-lg text-muted-foreground">
        {tr('about.yatHelpsYoungTalentsGetNoticed')}
      </p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {PILLARS.map(({ icon: Icon, title, text }) => (
        <div key={title} className="bg-card border border-border rounded-xl p-5 flex gap-4">
          <Icon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{text}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="flex flex-wrap gap-3">
      <Button asChild><Link to="/auth">{tr('about.createMyProfile')}</Link></Button>
      <Button asChild variant="outline"><Link to="/aide">{tr('common.frequentlyAskedQuestions')}</Link></Button>
      <Button asChild variant="ghost"><Link to="/legal/mentions-legales">{tr('footer.legal')}</Link></Button>
    </div>
  </div>
);

export default About;
