import React from 'react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Faq = { q: string; a: React.ReactNode };

const SECTIONS: { title: string; items: Faq[] }[] = [
  {
    title: 'Compte',
    items: [
      { q: 'Quel âge faut-il pour s’inscrire ?', a: <>13 ans minimum. Entre 13 et 14 ans, un parent reçoit un e-mail et doit donner son accord avant que la messagerie soit activée.</> },
      { q: 'Mon parent n’a pas reçu l’e-mail d’accord', a: <>Vérifiez ses courriers indésirables. Depuis le bandeau orange en haut de l’écran, vous pouvez renvoyer l’e-mail ou changer l’adresse.</> },
      { q: 'Comment changer ma date de naissance ?', a: <>Elle ne peut plus être modifiée une fois enregistrée, pour protéger les jeunes membres. Écrivez au support si elle est erronée.</> },
      { q: 'Comment supprimer mon compte ?', a: <>Paramètres → Compte → Zone dangereuse → « Supprimer mon compte ». La suppression est définitive.</> },
      { q: 'Comment récupérer mes données ?', a: <>Paramètres → Confidentialité → « Télécharger mes données » : vous obtenez un fichier JSON avec votre profil et tout ce que vous avez publié.</> },
    ],
  },
  {
    title: 'Sécurité',
    items: [
      { q: 'Qui peut m’envoyer un message ?', a: <>Tout membre, sauf si vous l’avez bloqué. Entre un adulte et un mineur, il faut d’abord être connectés (demande d’ami acceptée).</> },
      { q: 'Comment bloquer quelqu’un ?', a: <>Depuis son profil (bouton « Bloquer ») ou dans votre conversation (menu ⋮). Il ne pourra plus vous écrire et ses publications seront masquées.</> },
      { q: 'Comment signaler un contenu ?', a: <>Menu ⋯ d’une publication → « Signaler ». L’équipe de modération examine chaque signalement, en priorité ceux qui concernent un mineur.</> },
      { q: 'Qui voit mon e-mail et mon téléphone ?', a: <>Personne d’autre que vous, sauf si vous êtes agent, organisation, ou talent majeur avec un CV public.</> },
    ],
  },
  {
    title: 'Opportunités et formations',
    items: [
      { q: 'Comment publier une offre d’emploi ?', a: <>Avec un compte organisation : votre page organisation → onglet Recrutement → « Publier une offre ».</> },
      { q: 'Comment créer un cours ?', a: <>Formations → Créer. Après publication, vous arrivez sur la page du cours pour ajouter les leçons.</> },
      { q: 'Comment suivre ma progression ?', a: <>Inscrivez-vous au cours, puis cochez chaque leçon terminée. Votre progression apparaît sur la page du cours et dans votre tableau de bord.</> },
      { q: 'On me demande de l’argent pour une opportunité', a: <>Ne payez jamais pour « réserver » une place ou un essai. Signalez le profil et bloquez-le.</> },
    ],
  },
];

/** Aide / FAQ. */
const Help: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
    <header className="space-y-2">
      <p className="text-sm font-medium text-primary">Aide</p>
      <h1 className="text-3xl font-bold">Questions fréquentes</h1>
      <p className="text-muted-foreground">
        Vous ne trouvez pas la réponse ? Posez votre question à l’<Link to="/assistant" className="text-primary hover:underline">assistant YAT</Link> ou
        consultez les <Link to="/legal/cgu" className="text-primary hover:underline">conditions d’utilisation</Link>.
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
