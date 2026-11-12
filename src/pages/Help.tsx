import React from 'react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { tr } from '@/i18n';

type Faq = { q: string; a: React.ReactNode };

const SECTIONS: { title: string; items: Faq[] }[] = [
  {
    title: tr('settings.account'),
    items: [
      { q: tr('help.howOldDoYouHaveTo'), a: <>{tr('help.13MinimumBetween13And14')}</> },
      { q: tr('help.myParentDidNotReceiveThe'), a: <>{tr('help.checkTheirSpamFolderFromThe')}</> },
      { q: tr('help.howDoIChangeMyDate'), a: <>{tr('help.itCanNoLongerBeChanged')}</> },
      { q: tr('help.howDoIDeleteMyAccount'), a: <>{tr('help.settingsAccountDangerZoneDeleteMy')}</> },
      { q: tr('help.howDoIGetMyData'), a: <>{tr('help.settingsPrivacyDownloadMyDataYou')}</> },
    ],
  },
  {
    title: tr('settings.security'),
    items: [
      { q: tr('help.whoCanMessageMe'), a: <>{tr('help.anyMemberUnlessYouHaveBlocked')}</> },
      { q: tr('help.howDoIBlockSomeone'), a: <>{tr('help.fromTheirProfileBlockButtonOr')}</> },
      { q: tr('help.howDoIReportContent'), a: <>{tr('help.menuOfAPostReportThe')}</> },
      { q: tr('help.whoSeesMyEmailAndPhone'), a: <>{tr('help.noOneButYouUnlessYou')}</> },
    ],
  },
  {
    title: tr('help.opportunitiesAndCourses'),
    items: [
      { q: tr('help.howDoIPublishAJob'), a: <>{tr('help.withAnOrganizationAccountYourOrganization')}</> },
      { q: tr('help.howDoICreateACourse'), a: <>{tr('help.learningCreateAfterPublishingYouLand')}</> },
      { q: tr('help.howDoITrackMyProgress'), a: <>{tr('help.enrollInTheCourseThenTick')}</> },
      { q: tr('help.iAmAskedForMoneyFor'), a: <>{tr('help.neverPayToReserveASpot')}</> },
    ],
  },
];

/** Aide / FAQ. */
const Help: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
    <header className="space-y-2">
      <p className="text-sm font-medium text-primary">{tr('footer.help')}</p>
      <h1 className="text-3xl font-bold">{tr('common.frequentlyAskedQuestions')}</h1>
      <p className="text-muted-foreground">
        {tr('help.canTFindTheAnswerAsk')}<Link to="/assistant" className="text-primary hover:underline">{tr('help.yatAssistant')}</Link> {tr('help.orReadThe')} <Link to="/legal/cgu" className="text-primary hover:underline">{tr('help.termsOfUse')}</Link>.
      </p>
    </header>

    {SECTIONS.map(section => (
      <section key={section.title} className="space-y-2">
        <h2 className="text-lg font-semibold">{section.title}</h2>
        <Accordion type="multiple" className="bg-card border border-border rounded-xl px-4">
          {section.items.map(item => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    ))}
  </div>
);

export default Help;
