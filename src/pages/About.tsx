import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, GraduationCap, Map, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PILLARS = [
  { icon: Sparkles, title: 'Montrer son talent', text: "Un profil complet avec médias, CV public, YAT Score et badges de vérification, pour le sport, les arts, la musique ou un métier." },
  { icon: Users, title: 'Se connecter', text: "Fil d'actualité, communautés, messagerie et appels pour échanger avec d'autres jeunes, des agents et des organisations." },
  { icon: Briefcase, title: 'Trouver des opportunités', text: "Offres d'emploi, demandes de talents, contrats avec des agents et suggestions par intelligence artificielle." },
  { icon: GraduationCap, title: 'Progresser', text: 'Cours et formations, test d’aptitude, événements et niveaux qui récompensent l’activité.' },
  { icon: Map, title: 'Explorer autour de soi', text: 'YAT Karta place sur une carte les talents, les offres, les événements et les organisations.' },
  { icon: ShieldCheck, title: 'En sécurité', text: "Inscription dès 13 ans, accord parental avant 15 ans, messagerie protégée entre adultes et mineurs, blocage et signalement." },
];

/** Page « À propos » de Young & Talented. */
const About: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
    <header className="space-y-3 max-w-2xl">
      <p className="text-sm font-medium text-primary">À propos</p>
      <h1 className="text-3xl md:text-4xl font-bold">Young &amp; Talented</h1>
      <p className="text-lg text-muted-foreground">
        YAT aide les jeunes talents à se faire connaître, à rencontrer les bonnes personnes et à saisir des
        opportunités, que leur talent soit sportif, artistique ou professionnel.
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
      <Button asChild><Link to="/auth">Créer mon profil</Link></Button>
      <Button asChild variant="outline"><Link to="/aide">Questions fréquentes</Link></Button>
      <Button asChild variant="ghost"><Link to="/legal/mentions-legales">Mentions légales</Link></Button>
    </div>
  </div>
);

export default About;
