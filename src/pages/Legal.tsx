import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { tr } from '@/i18n';

/**
 * Pages légales : CGU, confidentialité, cookies, mentions légales.
 *
 * Ce sont des MODÈLES fondés sur le RGPD. Chaque mention [À COMPLÉTER] doit
 * être remplie, et l'ensemble relu par un juriste avant la mise en production.
 */

const LAST_UPDATE = '12 novembre 2026';

type Section = { title: string; body: React.ReactNode };
type LegalDoc = { title: string; intro?: React.ReactNode; sections: Section[] };

const TODO = ({ children }: { children: React.ReactNode }) => (
  <mark className="bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100 rounded px-1">{tr('legal.toBeCompleted')} {children}]</mark>
);

const DOCS: Record<string, LegalDoc> = {
  'mentions-legales': {
    title: tr('footer.legal'),
    sections: [
      {
        title: tr('legal.sitePublisher'),
        body: (
          <ul>
            <li>{tr('legal.companyName')} <TODO>{tr('legal.nameOfTheCompanyOrAssociation')}</TODO></li>
            <li>{tr('legal.legalFormAndCapital')} <TODO>{tr('legal.companyTypeAssociation')}</TODO></li>
            <li>{tr('legal.registeredOffice')} <TODO>{tr('legal.fullAddress')}</TODO></li>
            <li>{tr('legal.registration')} <TODO>{tr('legal.companyRegistrationNumber')}</TODO></li>
            <li>{tr('legal.euVatNumber')} <TODO>{tr('legal.ifApplicable')}</TODO></li>
            <li>{tr('legal.contact')} <TODO>{tr('legal.contactEmailAddress')}</TODO></li>
            <li>{tr('legal.publicationDirector')} <TODO>{tr('legal.nameAndPosition')}</TODO></li>
          </ul>
        ),
      },
      {
        title: tr('legal.hosting'),
        body: (
          <p>
            {tr('legal.dataAndTheBackEndAre')} <TODO>{tr('legal.supabaseRegionOfTheProjectE')}</TODO>{tr('legal.theWebsiteIsHostedBy')}{' '}
            <TODO>{tr('legal.frontEndHostAddress')}</TODO>.
          </p>
        ),
      },
      {
        title: tr('legal.intellectualProperty'),
        body: (
          <p>
            {tr('legal.theYoungTalentedBrandTheYat')}
          </p>
        ),
      },
      {
        title: tr('legal.reportContent'),
        body: (
          <p>
            {tr('legal.everyPostAndProfileCanBe')}{' '}
            <TODO>{tr('legal.moderationEmailAddress')}</TODO>{tr('legal.reportsInvolvingAMinorAreHandled')}
          </p>
        ),
      },
    ],
  },

  cgu: {
    title: tr('legal.termsOfUse'),
    intro: (
      <p>
        {tr('legal.theseTermsGovernTheUseOf')}
      </p>
    ),
    sections: [
      {
        title: tr('legal.1MinimumAgeAndMinorsAccounts'),
        body: (
          <>
            <p>{tr('legal.yatIsForPeopleAged')} <strong>{tr('legal.13AndOver')}</strong>{tr('legal.theDateOfBirthIsRequested')}</p>
            <ul>
              <li><strong>{tr('legal.ages13And14')}</strong> {tr('legal.consentFromAParentOrLegal')}</li>
              <li><strong>{tr('legal.ages15To17')}</strong> {tr('legal.signUpIsOpenButAn')}</li>
            </ul>
            <p>{tr('legal.aParentCanAtAnyTime')} <TODO>{tr('legal.contactEmailAddress')}</TODO>.</p>
          </>
        ),
      },
      {
        title: tr('legal.2YourAccount'),
        body: (
          <p>
            {tr('legal.youAgreeToProvideAccurateInformation')}
          </p>
        ),
      },
      {
        title: tr('legal.3PublishedContent'),
        body: (
          <>
            <p>
              {tr('legal.youRemainTheOwnerOfWhat')}
            </p>
            <p>{tr('legal.theFollowingAreProhibitedInParticular')}</p>
            <ul>
              <li>{tr('legal.sexualViolentHatefulDiscriminatoryOrHarassin')}</li>
              <li>{tr('legal.anySexualSolicitationOfAMinor')}</li>
              <li>{tr('legal.contentThatInfringesTheRightsOf')}</li>
              <li>{tr('legal.scamsFakeJobOffersAndRequests')}</li>
              <li>{tr('legal.spamAndImpersonation')}</li>
            </ul>
          </>
        ),
      },
      {
        title: tr('legal.4ModerationBlockingAndReporting'),
        body: (
          <p>
            {tr('legal.contentMayBeAnalysedAutomaticallyIncluding')}
          </p>
        ),
      },
      {
        title: tr('legal.5OpportunitiesContractsAndTransactions'),
        body: (
          <p>
            {tr('legal.yatConnectsTalentsAgentsAndOrganizations')}
          </p>
        ),
      },
      {
        title: tr('legal.6YatCoin'),
        body: (
          <p>
            {tr('legal.yatCoinsRewardActivityOnThe')}
          </p>
        ),
      },
      {
        title: tr('legal.7AccountDeletion'),
        body: (
          <p>
            {tr('legal.youCanDeleteYourAccountAt')}
          </p>
        ),
      },
      {
        title: tr('legal.8Liability'),
        body: (
          <p>
            {tr('legal.thePublisherMakesItsBestEfforts')}
          </p>
        ),
      },
      {
        title: tr('legal.9GoverningLaw'),
        body: (
          <p>
            {tr('legal.theseTermsAreGovernedByThe')} <TODO>{tr('legal.countryOfGoverningLaw')}</TODO>{tr('legal.inTheEventOfADispute')} <TODO>{tr('legal.city')}</TODO>.
          </p>
        ),
      },
    ],
  },

  confidentialite: {
    title: tr('legal.privacyPolicy'),
    intro: (
      <p>
        {tr('legal.thisPolicyExplainsWhichPersonalData')} <TODO>{tr('legal.publisherSCompanyNameAndAddress')}</TODO>{tr('legal.dataProtectionOfficer')} <TODO>{tr('legal.dpoNameOrEmailAddress')}</TODO>.
      </p>
    ),
    sections: [
      {
        title: tr('legal.dataCollected'),
        body: (
          <ul>
            <li><strong>{tr('settings.account')}</strong> {tr('legal.nameEmailPasswordEncryptedAccountType')}</li>
            <li><strong>{tr('sidebar.profile')}</strong> {tr('legal.photoBiographyCityAndCountrySkills')}</li>
            <li><strong>{tr('legal.content')}</strong> {tr('legal.postsCommentsStoriesShortsMediaMusic')}</li>
            <li><strong>{tr('location.label')}</strong> {tr('legal.theLocationYouChooseToShare')}</li>
            <li><strong>{tr('legal.activity')}</strong> {tr('legal.likesFollowsConnectionsLevelsYatCoins')}</li>
            <li><strong>{tr('common.verification')}</strong> {tr('legal.documentsSentToObtainABadge')}</li>
          </ul>
        ),
      },
      {
        title: tr('legal.purposesAndLegalBases'),
        body: (
          <ul>
            <li>{tr('legal.providingTheServiceAccountProfileMessaging')}</li>
            <li>{tr('legal.protectingMinorsModeratingContentPreventingF')}</li>
            <li>{tr('legal.recommendationsAndAiAssistantJobTalent')}</li>
            <li>{tr('legal.parentalConsentForAges1314')}</li>
          </ul>
        ),
      },
      {
        title: tr('legal.recipientsAndProcessors'),
        body: (
          <>
            <p>{tr('legal.yourPublicProfileAndYourPosts')}</p>
            <ul>
              <li><strong>Supabase</strong> {tr('legal.hostingOfTheDatabaseAuthenticationAnd')}</li>
              <li><strong>Moonshot AI (Kimi)</strong> {tr('legal.andDependingOnTheConfiguration')} <strong>haimaker</strong> {tr('legal.or')} <strong>OpenRouter</strong> {tr('legal.artificialIntelligenceProcessingAssistantTra')}</li>
              <li><strong>Mapbox</strong> {tr('legal.mapDisplay')}</li>
              <li><strong>Resend</strong> {tr('legal.sendingTheParentalConsentEmail')}</li>
              <li><strong>ipapi.co</strong> {tr('legal.estimatingTheCountryFromTheIp')}</li>
              <li><strong>Telegram</strong> {tr('legal.and')} <strong>VK</strong> {tr('legal.ifYouChooseToSignIn')}</li>
              <li><strong>{tr('legal.turnRelayServer')}</strong> {tr('legal.technicalRoutingOfAudioAndVideo')}</li>
            </ul>
            <p>
              {tr('legal.someProvidersAreLocatedOutsideThe')} <TODO>{tr('legal.checkAndListEachProviderS')}</TODO>
            </p>
          </>
        ),
      },
      {
        title: tr('legal.retentionPeriods'),
        body: (
          <ul>
            <li>{tr('legal.accountAndContentForAsLong')}</li>
            <li>{tr('legal.verificationDocuments')} <TODO>{tr('legal.periodEGUntilTheDecision')}</TODO>.</li>
            <li>{tr('legal.reportsAndModerationDecisions')} <TODO>{tr('legal.period')}</TODO>.</li>
            <li>{tr('legal.unvalidatedParentalConsentRequest')} <TODO>{tr('legal.periodEG30DaysBefore')}</TODO>.</li>
          </ul>
        ),
      },
      {
        title: tr('legal.yourRights'),
        body: (
          <>
            <p>{tr('legal.youHaveTheRightsOfAccess')}</p>
            <ul>
              <li><strong>{tr('legal.downloadYourData')}</strong> {tr('legal.settingsPrivacyDownloadMyData')}</li>
              <li><strong>{tr('legal.deleteYourAccount')}</strong> {tr('legal.settingsDangerZone')}</li>
              <li><strong>{tr('legal.otherRequests')}</strong> : <TODO>{tr('legal.dedicatedEmailAddress')}</TODO>{tr('legal.replyWithinOneMonth')}</li>
            </ul>
            <p>{tr('legal.youCanAlsoLodgeAComplaint')} <TODO>{tr('legal.eGCnilWwwCnilFr')}</TODO>.</p>
          </>
        ),
      },
      {
        title: tr('legal.minors'),
        body: (
          <p>
            {tr('legal.childrenUnder13CannotSignUp')} <TODO>{tr('legal.contactEmailAddress')}</TODO>.
          </p>
        ),
      },
    ],
  },

  cookies: {
    title: tr('legal.cookiesAndLocalStorage'),
    sections: [
      {
        title: tr('legal.whatYatStoresOnYourDevice'),
        body: (
          <ul>
            <li><strong>{tr('legal.loginSession')}</strong> {tr('legal.localStorageKeys')} <code>sb-…</code>{tr('legal.keepsYouLoggedInEssential')}</li>
            <li><strong>{tr('common.language')}</strong> (<code>yat-language</code>, <code>yat-language-geo-tried</code>{tr('legal.remembersYourLanguageEssential')}</li>
            <li><strong>{tr('settings.theme')}</strong> (<code>yat-theme</code>{tr('legal.remembersLightOrDarkModeEssential')}</li>
            <li><strong>{tr('legal.installableApp')}</strong> {tr('legal.aServiceWorkerCachesTheSite')}</li>
          </ul>
        ),
      },
      {
        title: tr('legal.noAdvertisingTrackers'),
        body: (
          <p>
            {tr('legal.yatUsesNoAdvertisingCookiesOr')}
          </p>
        ),
      },
      {
        title: tr('legal.clearingThisData'),
        body: (
          <p>
            {tr('legal.youCanClearItFromYour')}
          </p>
        ),
      },
    ],
  },
};

export const LEGAL_LINKS = [
  { slug: 'cgu', label: tr('legal.termsOfUse2') },
  { slug: 'confidentialite', label: tr('footer.privacy') },
  { slug: 'cookies', label: tr('footer.cookies') },
  { slug: 'mentions-legales', label: tr('footer.legal') },
] as const;

const Legal: React.FC = () => {
  const { doc = '' } = useParams();
  const page = DOCS[doc];
  if (!page) return <Navigate to="/legal/cgu" replace />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="flex flex-wrap gap-2 mb-6" aria-label={tr('common.legalDocuments')}>
        {LEGAL_LINKS.map(l => (
          <Link
            key={l.slug}
            to={`/legal/${l.slug}`}
            aria-current={l.slug === doc ? 'page' : undefined}
            className={`text-sm rounded-full px-3 py-1 border transition-colors ${l.slug === doc ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <article className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">{page.title}</h1>
          <p className="text-sm text-muted-foreground">{tr('legal.lastUpdated')} {LAST_UPDATE}</p>
        </header>

        <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <p>{tr('legal.documentBeingFinalisedTheHighlightedItems')}</p>
        </div>

        {page.intro && <div className="text-[15px] leading-relaxed">{page.intro}</div>}

        {page.sections.map(s => (
          <section key={s.title} className="space-y-2">
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <div className="text-[15px] leading-relaxed text-foreground/90 space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded">
              {s.body}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
};

export default Legal;
