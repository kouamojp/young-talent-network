import React from 'react';
import { CheckCircle2, Users, Search, RotateCcw, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TalentArea } from './testData';
import { useNavigate } from 'react-router-dom';

type ResultsDisplayProps = {
  talentAreas: TalentArea[];
  category?: string;
  onRetake?: () => void;
};

const matchedPeople = [
  { name: 'Sarah M.', type: 'Recruiter', looking: true, message: 'Looking for this skill' },
  { name: 'Jean-Luc D.', type: 'Talent', looking: false, message: 'Has similar aptitudes' },
  { name: 'Amina K.', type: 'Organization', looking: true, message: 'Hiring in this field' },
  { name: 'Carlos R.', type: 'Talent', looking: false, message: 'Shares your strengths' },
  { name: 'Li Wei', type: 'Mentor', looking: true, message: 'Can coach you in this area' },
];

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ talentAreas, category, onRetake }) => {
  const navigate = useNavigate();
  const topArea = talentAreas[0];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Test Completed!</h2>
        <p className="text-muted-foreground">
          Your top aptitude: <span className="font-semibold text-primary">{topArea?.area}</span> ({topArea?.score}%)
        </p>
      </div>

      {/* Talent Profile Bars */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold mb-4">Your Talent Profile</h3>
        <div className="space-y-4">
          {talentAreas.map((area, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm">{area.area}</span>
                <Badge variant={area.score >= 75 ? 'default' : 'secondary'}>{area.score}%</Badge>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${area.score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{area.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Matched People */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">People Connected to Your Aptitudes</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          These people are looking for your skills or share similar aptitudes
        </p>
        <div className="space-y-3">
          {matchedPeople.map((person, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{person.name}</p>
                  <p className="text-xs text-muted-foreground">{person.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={person.looking ? 'default' : 'outline'} className="text-xs">
                  {person.type}
                </Badge>
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
        <h3 className="font-semibold mb-2">💡 Recommendation</h3>
        <p className="text-sm text-muted-foreground">
          Based on your profile, we recommend exploring courses and opportunities in <strong>{topArea?.area}</strong>. 
          Connect with mentors and recruiters in this field to develop your talents further.
        </p>
      </Card>

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => navigate('/yat-database')}>
          <Search className="h-4 w-4 mr-2" />
          Find People with Similar Skills
        </Button>
        <Button variant="outline" onClick={onRetake}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Another Category
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
