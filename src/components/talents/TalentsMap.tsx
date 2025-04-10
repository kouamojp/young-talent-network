
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Music, MusicIcon, BookOpen, PenTool, Code, Dumbbell, HeartHandshake, ChevronRight, Heart } from 'lucide-react';

interface TalentsMapProps {
  talents: any[];
  selectedTalent: number | null;
  setSelectedTalent: (id: number | null) => void;
}

const TalentsMap: React.FC<TalentsMapProps> = ({ 
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
  
  const getMapPosition = (id: number) => {
    // This would be dynamic based on actual location data in a real app
    // Here we're just creating a visual display
    const positions: Record<number, {top: string, left: string}> = {
      1: { top: '30%', left: '45%' },
      2: { top: '40%', left: '55%' },
      3: { top: '50%', left: '30%' },
      4: { top: '60%', left: '70%' },
      5: { top: '25%', left: '65%' },
      6: { top: '70%', left: '40%' },
      7: { top: '45%', left: '20%' },
      8: { top: '55%', left: '60%' }
    };
    
    return positions[id] || { top: '50%', left: '50%' };
  };
  
  return (
    <div className="relative bg-blue-50 rounded-xl p-2 h-[500px] mb-8 overflow-hidden">
      {/* Map visualization */}
      <div className="absolute inset-0 bg-blue-50">
        {/* Stylized map elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-[80%] h-[1px] bg-blue-400 top-1/4 left-[10%]"></div>
          <div className="absolute w-[80%] h-[1px] bg-blue-400 top-2/4 left-[10%]"></div>
          <div className="absolute w-[80%] h-[1px] bg-blue-400 top-3/4 left-[10%]"></div>
          <div className="absolute w-[1px] h-[80%] bg-blue-400 left-1/4 top-[10%]"></div>
          <div className="absolute w-[1px] h-[80%] bg-blue-400 left-2/4 top-[10%]"></div>
          <div className="absolute w-[1px] h-[80%] bg-blue-400 left-3/4 top-[10%]"></div>
          
          <div className="absolute w-24 h-24 rounded-full bg-blue-200 top-[20%] left-[30%]"></div>
          <div className="absolute w-32 h-32 rounded-full bg-green-100 top-[60%] left-[20%]"></div>
          <div className="absolute w-28 h-28 rounded-full bg-purple-100 top-[40%] left-[70%]"></div>
        </div>
        
        {/* Talent markers */}
        {talents.map(talent => {
          const position = getMapPosition(talent.id);
          const isSelected = selectedTalent === talent.id;
          
          return (
            <div key={talent.id}>
              <button
                className={`absolute ${isSelected ? 'z-30' : 'z-20'} transition-all duration-300`}
                style={{ top: position.top, left: position.left }}
                onClick={() => setSelectedTalent(talent.id)}
              >
                <div className={`
                  relative p-1.5 rounded-full 
                  ${isSelected ? 'bg-white shadow-lg' : 'bg-white/80'} 
                  transition-all duration-300
                  before:absolute before:inset-0 before:rounded-full before:animate-ping before:bg-primary/30 before:scale-150
                `}>
                  {getTalentIcon(talent.category)}
                </div>
              </button>
            </div>
          );
        })}
        
        {/* Selected talent info card */}
        {selectedTalent && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-full max-w-md px-4 z-40">
            {talents.filter(t => t.id === selectedTalent).map(talent => (
              <Card key={talent.id} className="animate-fade-in shadow-lg">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarImage src={talent.avatar} alt={talent.name} />
                      <AvatarFallback>{talent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{talent.name}, {talent.age}</h3>
                          <p className="text-sm text-primary font-medium">{talent.talent} | {talent.distance}km away</p>
                        </div>
                        <Button size="sm" variant="outline" className="rounded-full">
                          <MapPin className="h-3 w-3 mr-1" />
                          {talent.location}
                        </Button>
                      </div>
                      
                      <p className="mt-2 text-sm">
                        Latest: '<span className="italic">{talent.preview}</span>' (click to preview)
                      </p>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div className="space-x-2">
                          <Button size="sm" className="rounded-full">
                            <span>👋 Send Wave</span>
                          </Button>
                          
                          <Button size="sm" variant="outline" className="rounded-full">
                            <HeartHandshake className="h-4 w-4 mr-1" />
                            <span>Collaborate</span>
                          </Button>
                        </div>
                        
                        <Button size="sm" variant="ghost">
                          <span className="text-xs">View Profile</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {talent.commonGround && (
                        <div className="mt-3 bg-purple-50 p-2 rounded-lg text-xs text-purple-700">
                          <span className="font-medium">Common Ground:</span> You and {talent.name.split(' ')[0]} both {talent.commonGround}! Say hi?
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentsMap;
