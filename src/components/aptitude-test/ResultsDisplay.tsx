import React from 'react';
import { CheckCircle2, Users, Search, RotateCcw, UserPlus, Star, Zap, Target, TrendingUp, MessageCircle, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { TalentArea, testCategories } from './testData';
import { useNavigate } from 'react-router-dom';
import { tr } from '@/i18n';

type ResultsDisplayProps = {
  talentAreas: TalentArea[];
  category?: string;
  onRetake?: () => void;
};

const getMatchedPeople = (category: string, topArea: string) => {
  const peopleByCategory: Record<string, Array<{ name: string; type: string; avatar: string; looking: boolean; message: string; skills: string[] }>> = {
    sports: [
      { name: 'Coach Martin', type: 'Recruteur', avatar: 'CM', looking: true, message: tr('resultsDisplay.lookingForTalentsIn', { p0: topArea }), skills: ['Football', 'Athlétisme'] },
      { name: 'Sarah Diallo', type: 'Talent', avatar: 'SD', looking: false, message: tr('resultsDisplay.sameAthleticAptitudesAsYou'), skills: ['Endurance', 'Agilité'] },
      { name: 'Club Olympique', type: 'Organisation', avatar: 'CO', looking: true, message: tr('resultsDisplay.recruitingInThisDiscipline'), skills: ['Formation', 'Compétition'] },
      { name: 'Pierre Nkoulou', type: 'Mentor', avatar: 'PN', looking: true, message: tr('resultsDisplay.canCoachYouInThisField'), skills: ['Coaching', 'Préparation'] },
      { name: 'Amina Touré', type: 'Talent', avatar: 'AT', looking: false, message: tr('resultsDisplay.sharesYourPhysicalStrengths'), skills: ['Sprint', 'Force'] },
    ],
    arts: [
      { name: 'Galerie Moderne', type: 'Organisation', avatar: 'GM', looking: true, message: tr('resultsDisplay.lookingForArtistsIn', { p0: topArea }), skills: ['Exposition', 'Vernissage'] },
      { name: 'Jean-Marc D.', type: 'Mentor', avatar: 'JD', looking: true, message: tr('resultsDisplay.establishedArtistAvailableForMentoring'), skills: ['Peinture', 'Sculpture'] },
      { name: 'Lisa Chen', type: 'Talent', avatar: 'LC', looking: false, message: tr('resultsDisplay.artisticProfileSimilarToYours'), skills: ['Design', 'Illustration'] },
      { name: 'Studio Créatif', type: 'Recruteur', avatar: 'SC', looking: true, message: tr('resultsDisplay.openCreativePositions'), skills: ['Direction artistique'] },
      { name: 'Fatou Sow', type: 'Talent', avatar: 'FS', looking: false, message: tr('resultsDisplay.sameCreativeAbilities'), skills: ['Art digital', 'Animation'] },
    ],
    music: [
      { name: 'Label Harmonie', type: 'Organisation', avatar: 'LH', looking: true, message: tr('resultsDisplay.lookingForTalentsIn', { p0: topArea }), skills: ['Production', 'Distribution'] },
      { name: 'DJ Karim', type: 'Mentor', avatar: 'DK', looking: true, message: tr('resultsDisplay.producerOffersMentoringSessions'), skills: ['Beatmaking', 'Mixage'] },
      { name: 'Nadia M.', type: 'Talent', avatar: 'NM', looking: false, message: tr('resultsDisplay.similarMusicalSkills'), skills: ['Chant', 'Piano'] },
      { name: 'Orchestra YAT', type: 'Recruteur', avatar: 'OY', looking: true, message: tr('resultsDisplay.openAuditions'), skills: ['Classique', 'Jazz'] },
      { name: 'Youssef B.', type: 'Talent', avatar: 'YB', looking: false, message: tr('resultsDisplay.sameMusicalProfile'), skills: ['Guitare', 'Composition'] },
    ],
    technology: [
      { name: 'TechCorp Africa', type: 'Organisation', avatar: 'TA', looking: true, message: tr('resultsDisplay.recruitingIn', { p0: topArea }), skills: ['Dev', 'Cloud'] },
      { name: 'Dr. Ada Obi', type: 'Mentor', avatar: 'AO', looking: true, message: tr('resultsDisplay.ctoOffersTechMentoring'), skills: ['Architecture', 'IA'] },
      { name: 'Kevin T.', type: 'Talent', avatar: 'KT', looking: false, message: tr('resultsDisplay.similarTechSkills'), skills: ['React', 'Python'] },
      { name: 'StartupHub', type: 'Recruteur', avatar: 'SH', looking: true, message: tr('resultsDisplay.techPositionsAvailable'), skills: ['Full-stack', 'DevOps'] },
      { name: 'Marie L.', type: 'Talent', avatar: 'ML', looking: false, message: tr('resultsDisplay.sameTechnicalProfile'), skills: ['Data', 'ML'] },
    ],
    business: [
      { name: 'YAT Ventures', type: 'Organisation', avatar: 'YV', looking: true, message: tr('resultsDisplay.lookingForProfilesIn', { p0: topArea }), skills: ['Startup', 'Financement'] },
      { name: 'CEO Moussa K.', type: 'Mentor', avatar: 'MK', looking: true, message: tr('resultsDisplay.entrepreneurAvailableForCoaching'), skills: ['Leadership', 'Stratégie'] },
      { name: 'Sophie R.', type: 'Talent', avatar: 'SR', looking: false, message: tr('resultsDisplay.sameEntrepreneurialProfile'), skills: ['Marketing', 'Vente'] },
      { name: 'BizConnect', type: 'Recruteur', avatar: 'BC', looking: true, message: tr('resultsDisplay.internshipAndJobOffers'), skills: ['Management', 'Finance'] },
      { name: 'Abdou D.', type: 'Talent', avatar: 'AD', looking: false, message: tr('resultsDisplay.sharesYourBusinessAptitudes'), skills: ['Négociation', 'Gestion'] },
    ],
    science: [
      { name: 'Lab Innovation', type: 'Organisation', avatar: 'LI', looking: true, message: tr('resultsDisplay.lookingForResearchersIn', { p0: topArea }), skills: ['R&D', 'Publication'] },
      { name: 'Pr. Diop', type: 'Mentor', avatar: 'PD', looking: true, message: tr('resultsDisplay.professorSupervisesProjects'), skills: ['Recherche', 'Enseignement'] },
      { name: 'Clara N.', type: 'Talent', avatar: 'CN', looking: false, message: tr('resultsDisplay.sameScientificProfile'), skills: ['Biologie', 'Chimie'] },
      { name: 'SciRecruit', type: 'Recruteur', avatar: 'SR', looking: true, message: tr('resultsDisplay.researchPositions'), skills: ['Laboratoire', 'Analyse'] },
      { name: 'Omar S.', type: 'Talent', avatar: 'OS', looking: false, message: tr('resultsDisplay.similarAnalyticalAptitudes'), skills: ['Data', 'Statistiques'] },
    ],
  };
  return peopleByCategory[category] || peopleByCategory.arts;
};

const getCapabilities = (talentAreas: TalentArea[]) => {
  const top = talentAreas[0];
  const second = talentAreas[1];
  return [
    { icon: Star, label: tr('resultsDisplay.mainStrength'), value: top?.area, detail: tr('resultsDisplay.scoreOfYourAreaOfExcellence', { p0: top?.score }) },
    { icon: Zap, label: tr('resultsDisplay.highPotential'), value: second?.area, detail: tr('resultsDisplay.scoreOfStrongDevelopmentPotential', { p0: second?.score }) },
    { icon: Target, label: tr('resultsDisplay.recommendedFocus'), value: top?.score >= 80 ? 'Spécialisation' : 'Exploration', detail: top?.score >= 80 ? tr('resultsDisplay.youAreReadyToSpecialize') : tr('resultsDisplay.exploreFurtherToRefineYourStrengths') },
    { icon: TrendingUp, label: tr('resultsDisplay.trajectory'), value: top?.score >= 70 ? 'Ascendante' : 'En construction', detail: top?.score >= 70 ? tr('resultsDisplay.yourAptitudesAreWellDeveloped') : tr('resultsDisplay.keepPracticingToProgress') },
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
        <h2 className="text-2xl font-bold mb-1">{tr('resultsDisplay.testCompleted')}</h2>
        <p className="text-white/90 text-lg">
          {tr('resultsDisplay.yourMainAptitude')} <strong>{topArea?.area}</strong>
        </p>
        <div className="inline-block bg-white/20 rounded-full px-4 py-1 mt-2">
          <span className="text-2xl font-bold">{topArea?.score}%</span>
          <span className="text-white/80 text-sm ml-1">{tr('resultsDisplay.match')}</span>
        </div>
      </div>

      {/* Capabilities Summary */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          {tr('resultsDisplay.yourAbilitiesAptitudes')}
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
        <h3 className="text-lg font-semibold mb-4">{tr('resultsDisplay.detailedAptitudeProfile')}</h3>
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
          <h3 className="text-lg font-semibold">{tr('resultsDisplay.theyAreLookingForYourAptitudes')}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {tr('resultsDisplay.recruitersOrganizationsAndMentorsLookingFor')}
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
                  <span className="text-xs hidden sm:inline">{tr('marketplace.contact')}</span>
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
          <h3 className="text-lg font-semibold">{tr('resultsDisplay.talentsWithSimilarAptitudes')}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {tr('resultsDisplay.thesePeopleShareTheSameStrengths')}
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
        <h3 className="font-semibold mb-2">{tr('resultsDisplay.personalizedRecommendation')}</h3>
        <p className="text-sm text-muted-foreground">
          {tr('resultsDisplay.basedOnYourProfileWeRecommend')} <strong>{topArea?.area}</strong>{tr('resultsDisplay.connectWithMentorsAndRecruitersIn')} 
          {topArea?.score >= 80 && tr('resultsDisplay.yourHighScoreShowsYouAre')}
          {topArea?.score < 80 && topArea?.score >= 65 && tr('resultsDisplay.youHaveGoodPotentialKeepLearning')}
        </p>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => navigate('/yat-database')}>
          <Search className="h-4 w-4 mr-2" />
          {tr('resultsDisplay.findCompatibleProfiles')}
        </Button>
        <Button variant="outline" onClick={() => navigate('/work')}>
          <Briefcase className="h-4 w-4 mr-2" />
          {tr('resultsDisplay.viewOpportunities')}
        </Button>
        <Button variant="ghost" onClick={onRetake}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {tr('resultsDisplay.testAnotherCategory')}
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
