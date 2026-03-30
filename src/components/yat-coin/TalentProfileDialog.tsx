import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, TrendingUp, Users, BarChart3, DollarSign, Award, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type TalentProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  talent: {
    id: number;
    name: string;
    title: string;
    category: string;
    tokenPrice: string;
    marketCap: string;
    change: string;
    rating: number;
    investors: number;
    skills: string[];
    image: string;
    projects: number;
    description: string;
  } | null;
  onInvest: () => void;
};

const TalentProfileDialog: React.FC<TalentProfileDialogProps> = ({ open, onOpenChange, talent, onInvest }) => {
  if (!talent) return null;

  const stats = [
    { label: 'Projects', value: talent.projects, icon: Target },
    { label: 'Investors', value: talent.investors, icon: Users },
    { label: 'Rating', value: talent.rating, icon: Star },
    { label: 'Growth', value: talent.change, icon: TrendingUp },
  ];

  const capabilities = [
    { name: 'Technical Skills', score: 88 },
    { name: 'Communication', score: 75 },
    { name: 'Leadership', score: 82 },
    { name: 'Problem Solving', score: 91 },
    { name: 'Creativity', score: 78 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Talent Profile</DialogTitle>
        </DialogHeader>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={talent.image} alt={talent.name} />
            <AvatarFallback className="text-lg">{talent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{talent.name}</h2>
            <p className="text-muted-foreground">{talent.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge>{talent.category}</Badge>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{talent.rating}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{talent.description}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {stats.map((stat, i) => (
            <Card key={i} className="p-3 text-center">
              <stat.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-sm font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Skills */}
        <Card className="p-4 mb-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Skills
          </h3>
          <div className="flex flex-wrap gap-1">
            {talent.skills.map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
            ))}
          </div>
        </Card>

        {/* Capabilities */}
        <Card className="p-4 mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Capabilities Assessment
          </h3>
          <div className="space-y-3">
            {capabilities.map((cap, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{cap.name}</span>
                  <span className="font-medium">{cap.score}%</span>
                </div>
                <Progress value={cap.score} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Market Info */}
        <Card className="p-4 mb-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Market Information
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Token Price</p>
              <p className="font-bold text-lg">{talent.tokenPrice}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Market Cap</p>
              <p className="font-bold text-lg">{talent.marketCap}</p>
            </div>
          </div>
        </Card>

        <Button className="w-full" onClick={() => { onOpenChange(false); onInvest(); }}>
          <DollarSign className="h-4 w-4 mr-2" />
          Invest in {talent.name}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TalentProfileDialog;
