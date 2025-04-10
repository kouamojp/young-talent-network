
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Music, MusicIcon, BookOpen, PenTool, Code, Dumbbell, HeartHandshake, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TalentsListProps {
  talents: any[];
  selectedTalent: number | null;
  setSelectedTalent: (id: number | null) => void;
}

const TalentsList: React.FC<TalentsListProps> = ({ 
  talents, 
  selectedTalent,
  setSelectedTalent 
}) => {
  const getTalentIcon = (category: string) => {
    switch(category) {
      case 'music': return <MusicIcon className="h-5 w-5 text-purple-600" />;
      case 'dance': return <Music className="h-5 w-5 text-pink-500" />;
      case 'academics': return <BookOpen className="h-5 w-5 text-blue-600" />;
      case 'art': return <PenTool className="h-5 w-5 text-orange-500" />;
      case 'tech': return <Code className="h-5 w-5 text-green-600" />;
      case 'sports': return <Dumbbell className="h-5 w-5 text-red-500" />;
      default: return <Heart className="h-5 w-5 text-primary" />;
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {talents.map(talent => (
        <Card 
          key={talent.id} 
          className={`hover:shadow-md transition-shadow cursor-pointer overflow-hidden ${
            selectedTalent === talent.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedTalent(talent.id === selectedTalent ? null : talent.id)}
        >
          <div className="relative h-36 bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
            <div className="absolute inset-0 opacity-25 flex items-center justify-center overflow-hidden">
              {Array.from({ length: 10 }).map((_, index) => (
                <div 
                  key={index}
                  className="absolute bg-white/30 rounded-full"
                  style={{ 
                    width: `${20 + Math.random() * 40}px`, 
                    height: `${20 + Math.random() * 40}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: 0.1 + Math.random() * 0.3
                  }}
                ></div>
              ))}
            </div>
            
            <div className="z-10 text-5xl">
              {talent.category === 'music' && '🎵'}
              {talent.category === 'dance' && '💃'}
              {talent.category === 'academics' && '🧠'}
              {talent.category === 'art' && '🎨'}
              {talent.category === 'tech' && '💻'}
              {talent.category === 'sports' && '⚽'}
              {talent.category === 'writing' && '✍️'}
            </div>
            
            <Badge className="absolute top-2 right-2 bg-white/80 text-primary border-none">
              {talent.talent} | {talent.age} | {talent.distance}km
            </Badge>
          </div>
          
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={talent.avatar} alt={talent.name} />
                <AvatarFallback>{talent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{talent.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span>{talent.location} area</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTalentIcon(talent.category)}
                  </div>
                </div>
                
                <p className="mt-2 text-sm line-clamp-2">{talent.description}</p>
                
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="rounded-full flex-1">
                    <span>👋 Wave</span>
                  </Button>
                  
                  <Button size="sm" variant="outline" className="rounded-full">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Invite to collaborate</span>
                  </Button>
                </div>
                
                {talent.commonGround && selectedTalent === talent.id && (
                  <div className="mt-3 bg-purple-50 p-2 rounded-lg text-xs text-purple-700 animate-fade-in">
                    <span className="font-medium">Common Ground:</span> You and {talent.name.split(' ')[0]} both {talent.commonGround}!
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TalentsList;
