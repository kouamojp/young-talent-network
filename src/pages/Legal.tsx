import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

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
  <mark className="bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100 rounded px-1">[À COMPLÉTER : {children}]</mark>
);

const DOCS: Record<string, LegalDoc> = {
  'mentions-legales': {
    title: 'Mentions légales',
    sections: [
      {
        title: 'Éditeur du site',
        body: (
          <ul>
            <li>Raison sociale : <TODO>nom de la société ou de l'association</TODO></li>
            <li>Forme juridique et capital : <TODO>SAS, SARL, association…</TODO></li>
            <li>Siège social : <TODO>adresse complète</TODO></li>
            <li>Immatriculation : <TODO>RCS / SIREN / numéro d'enregistrement</TODO></li>
            <li>Numéro de TVA intracommunautaire : <TODO>si applicable</TODO></li>
            <li>Contact : <TODO>adresse e-mail de contact</TODO></li>
            <li>Directeur de la publication : <TODO>nom et fonction</TODO></li>
          </ul>
        ),
      },
      {
        title: 'Hébergement',
        body: (
          <p>
            Les données et le back-end sont hébergés par Supabase Inc. (970 Toa Payoh North #07-04, Singapour), sur des
            serveurs situés dans la région <TODO>région Supabase du projet, ex. eu-west</TODO>. Le site web est hébergé par{' '}
            <TODO>hébergeur du front-end, adresse</TODO>.
          </p>
        ),
      },
      {
        title: 'Propriété intellectuelle',
        body: (
          <p>
            La marque Young &amp; Talented, le logo YAT, la charte graphique et le code de la plateforme sont la propriété de
            l'éditeur. Les contenus publiés par les membres (photos, vidéos, textes, musique) restent leur propriété : voir les
            conditions générales d'utilisation.
          </p>
        ),
      },
      {
        title: 'Signaler un contenu',
        body: (
          <p>
            Chaque publication et chaque profil peut être signalé depuis son menu « Signaler ». Vous pouvez aussi écrire à{' '}
            <TODO>adresse e-mail de modération</TODO>. Les signalements concernant un mineur sont traités en priorité.
          </p>
        ),
      },
    ],
  },

  cgu: {
    title: "Conditions générales d'utilisation",
    intro: (
      <p>
        Les présentes conditions encadrent l'utilisation de Young &amp; Talented (« YAT »), plateforme qui permet aux jeunes
        de présenter leurs talents (sport, arts, musique, métiers…) et d'échanger avec d'autres membres, des agents et des
        organisations. En créant un compte, vous acceptez ces conditions.
      </p>
    ),
    sections: [
      {
        title: '1. Âge minimum et comptes de mineurs',
        body: (
          <>
            <p>YAT est réservé aux personnes de <strong>13 ans et plus</strong>. La date de naissance est demandée à l'inscription et ne peut plus être modifiée ensuite que par le support.</p>
            <ul>
              <li><strong>13 et 14 ans</strong> : l'accord d'un parent ou du titulaire de l'autorité parentale est obligatoire. Un e-mail lui est envoyé ; tant qu'il n'a pas donné son accord, la messagerie est désactivée.</li>
              <li><strong>15 à 17 ans</strong> : l'inscription est libre, mais un adulte ne peut envoyer de message privé à un mineur que si vous êtes connectés (demande d'ami acceptée).</li>
            </ul>
            <p>Un parent peut à tout moment demander la suppression du compte de son enfant en écrivant à <TODO>adresse e-mail de contact</TODO>.</p>
          </>
        ),
      },
      {
        title: '2. Votre compte',
        body: (
          <p>
            Vous vous engagez à fournir des informations exactes, à garder votre mot de passe confidentiel et à ne pas créer de
            compte au nom d'une autre personne. Les comptes agent et organisation doivent représenter une activité réelle ; ils
            peuvent demander un badge de vérification.
          </p>
        ),
      },
      {
        title: '3. Contenus publiés',
        body: (
          <>
            <p>
              Vous restez propriétaire de ce que vous publiez. Vous accordez à l'éditeur une licence non exclusive, gratuite et
              mondiale pour héberger, afficher et diffuser ces contenus sur YAT, pendant la durée de leur publication.
            </p>
            <p>Sont interdits notamment :</p>
            <ul>
              <li>les contenus sexuels, violents, haineux, discriminatoires ou de harcèlement ;</li>
              <li>toute sollicitation d'un mineur à caractère sexuel ou toute tentative d'obtenir ses coordonnées personnelles ;</li>
              <li>les contenus qui portent atteinte aux droits d'autrui (droit à l'image, droit d'auteur) ;</li>
              <li>les arnaques, offres d'emploi fictives et demandes d'argent pour « réserver » une opportunité ;</li>
              <li>le spam et l'usurpation d'identité.</li>
            </ul>
          </>
        ),
      },
      {
        title: '4. Modération, blocage et signalement',
        body: (
          <p>
            Les contenus peuvent être analysés automatiquement (y compris par un outil d'intelligence artificielle) et examinés
            par l'équipe de modération. Vous pouvez signaler un contenu ou un profil, et bloquer un membre : il ne pourra plus vous
            écrire. L'éditeur peut retirer un contenu ou suspendre un compte qui ne respecte pas ces conditions.
          </p>
        ),
      },
      {
        title: '5. Opportunités, contrats et transactions',
        body: (
          <p>
            YAT met en relation talents, agents et organisations, mais n'est pas partie aux contrats conclus entre membres. Aucune
            somme ne doit être demandée à un talent pour accéder à une opportunité. Les éventuelles fonctionnalités payantes
            feront l'objet de conditions de vente distinctes.
          </p>
        ),
      },
      {
        title: '6. YAT Coin',
        body: (
          <p>
            Les YAT Coins récompensent l'activité sur la plateforme. Ils n'ont pas de valeur monétaire, ne sont ni remboursables
            ni échangeables contre de l'argent, et peuvent être retirés en cas d'abus.
          </p>
        ),
      },
      {
        title: '7. Suppression du compte',
        body: (
          <p>
            Vous pouvez supprimer votre compte à tout moment depuis Paramètres → Zone dangereuse. La suppression est définitive.
            Vous pouvez aussi télécharger une copie de vos données depuis Paramètres → Confidentialité.
          </p>
        ),
      },
      {
        title: '8. Responsabilité',
        body: (
          <p>
            L'éditeur fait ses meilleurs efforts pour assurer la disponibilité du service, sans garantie d'absence
            d'interruption. Chaque membre est responsable des contenus qu'il publie et des échanges qu'il a avec les autres membres.
          </p>
        ),
      },
      {
        title: '9. Droit applicable',
        body: (
          <p>
            Ces conditions sont soumises au droit <TODO>pays du droit applicable</TODO>. En cas de litige, une solution amiable
            sera recherchée avant toute action devant les tribunaux compétents de <TODO>ville</TODO>.
          </p>
        ),
      },
    ],
  },

  confidentialite: {
    title: 'Politique de confidentialité',
    intro: (
      <p>
        Cette politique explique quelles données personnelles YAT collecte, pourquoi, avec qui elles sont partagées et comment
        exercer vos droits. Le responsable du traitement est <TODO>raison sociale et adresse de l'éditeur</TODO>.
        Délégué à la protection des données : <TODO>nom ou adresse e-mail du DPO</TODO>.
      </p>
    ),
    sections: [
      {
        title: 'Données collectées',
        body: (
          <ul>
            <li><strong>Compte</strong> : nom, e-mail, mot de passe (chiffré), type de compte, date de naissance et, pour les moins de 15 ans, e-mail d'un parent.</li>
            <li><strong>Profil</strong> : photo, biographie, ville et pays, compétences, expériences, formations, réalisations, liens vers vos réseaux sociaux, CV.</li>
            <li><strong>Contenus</strong> : publications, commentaires, stories, shorts, médias, musique, messages privés, appels (date, durée, participants ; le contenu audio et vidéo n'est pas enregistré).</li>
            <li><strong>Localisation</strong> : la position que vous choisissez de partager (fonction « Talents autour de moi », carte YAT Karta). Votre pays est aussi estimé à partir de votre adresse IP pour choisir la langue.</li>
            <li><strong>Activité</strong> : likes, abonnements, connexions, niveaux, YAT Coins, résultats du test d'aptitude.</li>
            <li><strong>Vérification</strong> : documents envoyés pour obtenir un badge, consultés uniquement par l'équipe de vérification.</li>
          </ul>
        ),
      },
      {
        title: 'Finalités et bases légales',
        body: (
          <ul>
            <li>Fournir le service (compte, profil, messagerie, mise en relation) : exécution du contrat.</li>
            <li>Protéger les mineurs, modérer les contenus, prévenir la fraude : intérêt légitime et obligation légale.</li>
            <li>Recommandations et assistant IA (suggestions d'offres, de talents, traduction) : intérêt légitime, désactivable en n'utilisant pas ces fonctions.</li>
            <li>Accord parental pour les 13-14 ans : obligation légale (âge du consentement numérique).</li>
          </ul>
        ),
      },
      {
        title: 'Destinataires et sous-traitants',
        body: (
          <>
            <p>Votre profil public et vos publications sont visibles par les autres membres. Nous faisons appel aux prestataires suivants :</p>
            <ul>
              <li><strong>Supabase</strong> : hébergement de la base de données, authentification et fichiers.</li>
              <li><strong>Moonshot AI (Kimi)</strong> et, selon la configuration, <strong>haimaker</strong> ou <strong>OpenRouter</strong> : traitements d'intelligence artificielle (assistant, traduction, modération, suggestions). Seules les données nécessaires à la demande sont transmises.</li>
              <li><strong>Mapbox</strong> : affichage des cartes.</li>
              <li><strong>Resend</strong> : envoi de l'e-mail d'accord parental.</li>
              <li><strong>ipapi.co</strong> : estimation du pays à partir de l'adresse IP, pour la langue.</li>
              <li><strong>Telegram</strong> et <strong>VK</strong> : si vous choisissez de vous connecter avec ces services.</li>
              <li><strong>Serveur relais TURN</strong> : acheminement technique des appels audio et vidéo.</li>
            </ul>
            <p>
              Certains prestataires sont situés hors de l'Union européenne. Ces transferts sont encadrés par des clauses
              contractuelles types de la Commission européenne. <TODO>vérifier et lister les garanties de chaque prestataire</TODO>
            </p>
          </>
        ),
      },
      {
        title: 'Durées de conservation',
        body: (
          <ul>
            <li>Compte et contenus : tant que le compte existe ; supprimés lors de la suppression du compte.</li>
            <li>Documents de vérification : <TODO>durée, ex. jusqu'à la décision puis 1 an</TODO>.</li>
            <li>Signalements et décisions de modération : <TODO>durée</TODO>.</li>
            <li>Demande d'accord parental non validée : <TODO>durée, ex. 30 jours avant suppression du compte</TODO>.</li>
          </ul>
        ),
      },
      {
        title: 'Vos droits',
        body: (
          <>
            <p>Vous disposez des droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité.</p>
            <ul>
              <li><strong>Télécharger vos données</strong> : Paramètres → Confidentialité → « Télécharger mes données ».</li>
              <li><strong>Supprimer votre compte</strong> : Paramètres → Zone dangereuse.</li>
              <li><strong>Autres demandes</strong> : <TODO>adresse e-mail dédiée</TODO>. Réponse sous un mois.</li>
            </ul>
            <p>Vous pouvez aussi saisir l'autorité de protection des données : <TODO>ex. CNIL, www.cnil.fr</TODO>.</p>
          </>
        ),
      },
      {
        title: 'Mineurs',
        body: (
          <p>
            Les moins de 13 ans ne peuvent pas s'inscrire. Pour les 13-14 ans, un parent doit valider le compte par e-mail.
            La date de naissance des membres n'est utilisée que pour appliquer ces règles et les protections de la messagerie.
            Un parent peut demander l'accès aux données de son enfant ou leur suppression à <TODO>adresse e-mail de contact</TODO>.
          </p>
        ),
      },
    ],
  },

  cookies: {
    title: 'Cookies et stockage local',
    sections: [
      {
        title: "Ce que YAT enregistre sur votre appareil",
        body: (
          <ul>
            <li><strong>Session de connexion</strong> (stockage local, clés <code>sb-…</code>) : vous garde connecté. Indispensable.</li>
            <li><strong>Langue</strong> (<code>yat-language</code>, <code>yat-language-geo-tried</code>) : mémorise votre langue. Indispensable.</li>
            <li><strong>Thème</strong> (<code>yat-theme</code>) : mémorise le mode clair ou sombre. Indispensable.</li>
            <li><strong>Application installable</strong> : un service worker met en cache les fichiers du site pour qu'il se charge plus vite.</li>
          </ul>
        ),
      },
      {
        title: 'Pas de traceurs publicitaires',
        body: (
          <p>
            YAT n'utilise aucun cookie publicitaire ni outil de mesure d'audience tiers. Les traceurs ci-dessus sont nécessaires
            au fonctionnement du service et ne demandent donc pas de consentement. Si un outil de mesure est ajouté plus tard,
            un bandeau de consentement sera affiché.
          </p>
        ),
      },
      {
        title: 'Effacer ces données',
        body: (
          <p>
            Vous pouvez les effacer depuis les réglages de votre navigateur, ou depuis Paramètres → « Vider le cache » dans YAT.
            Vous serez alors déconnecté.
          </p>
        ),
      },
    ],
  },
};

export const LEGAL_LINKS = [
  { slug: 'cgu', label: "Conditions d'utilisation" },
  { slug: 'confidentialite', label: 'Confidentialité' },
  { slug: 'cookies', label: 'Cookies' },
  { slug: 'mentions-legales', label: 'Mentions légales' },
] as const;

const Legal: React.FC = () => {
  const { doc = '' } = useParams();
  const page = DOCS[doc];
  if (!page) return <Navigate to="/legal/cgu" replace />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="flex flex-wrap gap-2 mb-6" aria-label="Documents légaux">
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
          <p className="text-sm text-muted-foreground">Dernière mise à jour : {LAST_UPDATE}</p>
        </header>

        <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <p>Document en cours de finalisation : les mentions surlignées doivent être complétées et le texte relu par un juriste.</p>
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
