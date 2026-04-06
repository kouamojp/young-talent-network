import React from 'react';
import { CheckCircle2, Users, Search, RotateCcw, UserPlus, Star, Zap, Target, TrendingUp, MessageCircle, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { TalentArea, testCategories } from './testData';
import { useNavigate } from 'react-router-dom';

type ResultsDisplayProps = {
  talentAreas: TalentArea[];
  category?: string;
  onRetake?: () => void;
};

const getMatchedPeople = (category: string, topArea: string) => {
  const peopleByCategory: Record<string, Array<{ name: string; type: string; avatar: string; looking: boolean; message: string; skills: string[] }>> = {
    sports: [
      { name: 'Coach Martin', type: 'Recruteur', avatar: 'CM', looking: true, message: `Recherche talents en ${topArea}`, skills: ['Football', 'Athlétisme'] },
      { name: 'Sarah Diallo', type: 'Talent', avatar: 'SD', looking: false, message: 'Mêmes aptitudes sportives que vous', skills: ['Endurance', 'Agilité'] },
      { name: 'Club Olympique', type: 'Organisation', avatar: 'CO', looking: true, message: 'Recrute dans cette discipline', skills: ['Formation', 'Compétition'] },
      { name: 'Pierre Nkoulou', type: 'Mentor', avatar: 'PN', looking: true, message: 'Peut vous coacher dans ce domaine', skills: ['Coaching', 'Préparation'] },
      { name: 'Amina Touré', type: 'Talent', avatar: 'AT', looking: false, message: 'Partage vos forces physiques', skills: ['Sprint', 'Force'] },
    ],
    arts: [
      { name: 'Galerie Moderne', type: 'Organisation', avatar: 'GM', looking: true, message: `Cherche artistes en ${topArea}`, skills: ['Exposition', 'Vernissage'] },
      { name: 'Jean-Marc D.', type: 'Mentor', avatar: 'JD', looking: true, message: 'Artiste confirmé, disponible pour mentorat', skills: ['Peinture', 'Sculpture'] },
      { name: 'Lisa Chen', type: 'Talent', avatar: 'LC', looking: false, message: 'Profil artistique similaire au vôtre', skills: ['Design', 'Illustration'] },
      { name: 'Studio Créatif', type: 'Recruteur', avatar: 'SC', looking: true, message: 'Postes ouverts en création', skills: ['Direction artistique'] },
      { name: 'Fatou Sow', type: 'Talent', avatar: 'FS', looking: false, message: 'Mêmes capacités créatives', skills: ['Art digital', 'Animation'] },
    ],
    music: [
      { name: 'Label Harmonie', type: 'Organisation', avatar: 'LH', looking: true, message: `Recherche talents en ${topArea}`, skills: ['Production', 'Distribution'] },
      { name: 'DJ Karim', type: 'Mentor', avatar: 'DK', looking: true, message: 'Producteur, offre des sessions de mentorat', skills: ['Beatmaking', 'Mixage'] },
      { name: 'Nadia M.', type: 'Talent', avatar: 'NM', looking: false, message: 'Compétences musicales proches', skills: ['Chant', 'Piano'] },
      { name: 'Orchestra YAT', type: 'Recruteur', avatar: 'OY', looking: true, message: 'Auditions ouvertes', skills: ['Classique', 'Jazz'] },
      { name: 'Youssef B.', type: 'Talent', avatar: 'YB', looking: false, message: 'Même profil musical', skills: ['Guitare', 'Composition'] },
    ],
    technology: [
      { name: 'TechCorp Africa', type: 'Organisation', avatar: 'TA', looking: true, message: `Recrute en ${topArea}`, skills: ['Dev', 'Cloud'] },
      { name: 'Dr. Ada Obi', type: 'Mentor', avatar: 'AO', looking: true, message: 'CTO, offre du mentorat tech', skills: ['Architecture', 'IA'] },
      { name: 'Kevin T.', type: 'Talent', avatar: 'KT', looking: false, message: 'Compétences tech similaires', skills: ['React', 'Python'] },
      { name: 'StartupHub', type: 'Recruteur', avatar: 'SH', looking: true, message: 'Postes tech disponibles', skills: ['Full-stack', 'DevOps'] },
      { name: 'Marie L.', type: 'Talent', avatar: 'ML', looking: false, message: 'Même profil technique', skills: ['Data', 'ML'] },
    ],
    business: [
      { name: 'YAT Ventures', type: 'Organisation', avatar: 'YV', looking: true, message: `Cherche profils en ${topArea}`, skills: ['Startup', 'Financement'] },
      { name: 'CEO Moussa K.', type: 'Mentor', avatar: 'MK', looking: true, message: 'Entrepreneur, disponible pour coaching', skills: ['Leadership', 'Stratégie'] },
      { name: 'Sophie R.', type: 'Talent', avatar: 'SR', looking: false, message: 'Même profil entrepreneurial', skills: ['Marketing', 'Vente'] },
      { name: 'BizConnect', type: 'Recruteur', avatar: 'BC', looking: true, message: 'Offres de stage et emploi', skills: ['Management', 'Finance'] },
      { name: 'Abdou D.', type: 'Talent', avatar: 'AD', looking: false, message: 'Partage vos aptitudes business', skills: ['Négociation', 'Gestion'] },
    ],
    science: [
      { name: 'Lab Innovation', type: 'Organisation', avatar: 'LI', looking: true, message: `Cherche chercheurs en ${topArea}`, skills: ['R&D', 'Publication'] },
      { name: 'Pr. Diop', type: 'Mentor', avatar: 'PD', looking: true, message: 'Professeur, supervise des projets', skills: ['Recherche', 'Enseignement'] },
      { name: 'Clara N.', type: 'Talent', avatar: 'CN', looking: false, message: 'Même profil scientifique', skills: ['Biologie', 'Chimie'] },
      { name: 'SciRecruit', type: 'Recruteur', avatar: 'SR', looking: true, message: 'Postes en recherche', skills: ['Laboratoire', 'Analyse'] },
      { name: 'Omar S.', type: 'Talent', avatar: 'OS', looking: false, message: 'Aptitudes analytiques similaires', skills: ['Data', 'Statistiques'] },
    ],
  };
  return peopleByCategory[category] || peopleByCategory.arts;
};

const getCapabilities = (talentAreas: TalentArea[]) => {
  const top = talentAreas[0];
  const second = talentAreas[1];
  return [
    { icon: Star, label: 'Force principale', value: top?.area, detail: `Score de ${top?.score}% — votre domaine d'excellence` },
    { icon: Zap, label: 'Potentiel élevé', value: second?.area, detail: `Score de ${second?.score}% — fort potentiel de développement` },
    { icon: Target, label: 'Focus recommandé', value: top?.score >= 80 ? 'Spécialisation' : 'Exploration', detail: top?.score >= 80 ? 'Vous êtes prêt à vous spécialiser' : 'Explorez davantage pour affiner vos forces' },
    { icon: TrendingUp, label: 'Trajectoire', value: top?.score >= 70 ? 'Ascendante' : 'En construction', detail: top?.score >= 70 ? 'Vos aptitudes sont bien développées' : 'Continuez à pratiquer pour progresser' },
  ];
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ talentAreas, category = 'arts', onRetake }) => {
  const navigate = useNavigate();
  const topArea = talentAreas[0];
  const catInfo = testCategories.find(c => c.id === category);
  const matchedPeople = getMatchedPeople(category, topArea?.area || '');
  const capabilities = getCapabilities(talentAreas);

  const seekers = matchedPeople.filter(p => p.looking);
  const similars = matchedPeople.filter(p => !p.looking);

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className={`bg-gradient-to-r ${catInfo?.color || 'from-indigo-600 to-purple-600'} rounded-xl p-6 text-white text-center`}>
        <div className="inline-block p-3 bg-white/20 rounded-full mb-3">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-1">Test Complété ! 🎉</h2>
        <p className="text-white/90 text-lg">
          Votre aptitude principale : <strong>{topArea?.area}</strong>
        </p>
        <div className="inline-block bg-white/20 rounded-full px-4 py-1 mt-2">
          <span className="text-2xl font-bold">{topArea?.score}%</span>
          <span className="text-white/80 text-sm ml-1">de compatibilité</span>
        </div>
      </div>

      {/* Capabilities Summary */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Vos Capacités & Aptitudes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {capabilities.map((cap, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <cap.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{cap.label}</p>
                <p className="font-semibold text-sm">{cap.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{cap.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detailed Scores */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold mb-4">Profil Détaillé des Aptitudes</h3>
        <div className="space-y-4">
          {talentAreas.map((area, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm">{area.area}</span>
                <Badge variant={area.score >= 80 ? 'default' : area.score >= 65 ? 'secondary' : 'outline'}>
                  {area.score}%
                </Badge>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    area.score >= 80 ? 'bg-primary' : area.score >= 65 ? 'bg-amber-500' : 'bg-muted-foreground/40'
                  }`}
                  style={{ width: `${area.score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{area.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* People Looking for Your Skills */}
      <Card className="p-5 border-primary/20">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Ils recherchent vos aptitudes</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Recruteurs, organisations et mentors qui cherchent exactement votre profil
        </p>
        <div className="space-y-3">
          {seekers.map((person, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/30">
                  <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{person.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{person.name}</p>
                  <p className="text-xs text-muted-foreground">{person.message}</p>
                  <div className="flex gap-1 mt-1">
                    {person.skills.map((s, j) => (
                      <Badge key={j} variant="outline" className="text-[10px] px-1.5 py-0">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="text-xs">{person.type}</Badge>
                <Button size="sm" variant="default" className="h-8 gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span className="text-xs hidden sm:inline">Contacter</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* People with Similar Skills */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Talents aux aptitudes similaires</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Ces personnes partagent les mêmes forces et capacités que vous
        </p>
        <div className="space-y-3">
          {similars.map((person, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-xs">{person.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{person.name}</p>
                  <p className="text-xs text-muted-foreground">{person.message}</p>
                  <div className="flex gap-1 mt-1">
                    {person.skills.map((s, j) => (
                      <Badge key={j} variant="outline" className="text-[10px] px-1.5 py-0">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{person.type}</Badge>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendation */}
      <Card className="p-5 border-primary/20 bg-primary/5">
        <h3 className="font-semibold mb-2">💡 Recommandation personnalisée</h3>
        <p className="text-sm text-muted-foreground">
          Basé sur votre profil, nous vous recommandons d'explorer les formations et opportunités en <strong>{topArea?.area}</strong>. 
          Connectez-vous avec les mentors et recruteurs de ce domaine pour développer vos talents. 
          {topArea?.score >= 80 && " Votre score élevé indique que vous êtes prêt pour des opportunités professionnelles !"}
          {topArea?.score < 80 && topArea?.score >= 65 && " Vous avez un bon potentiel — continuez à vous former pour atteindre l'excellence."}
        </p>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => navigate('/yat-database')}>
          <Search className="h-4 w-4 mr-2" />
          Trouver des profils compatibles
        </Button>
        <Button variant="outline" onClick={() => navigate('/work')}>
          <Briefcase className="h-4 w-4 mr-2" />
          Voir les opportunités
        </Button>
        <Button variant="ghost" onClick={onRetake}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Tester une autre catégorie
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
