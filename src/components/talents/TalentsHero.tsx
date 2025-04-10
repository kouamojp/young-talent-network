
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, Sparkles } from 'lucide-react';

interface TalentsHeroProps {
  talentCount: number;
  distance: number;
  viewMode: 'map' | 'list';
  setViewMode: (mode: 'map' | 'list') => void;
}

const TalentsHero: React.FC<TalentsHeroProps> = ({ 
  talentCount, 
  distance,
  viewMode,
  setViewMode
}) => {
  return (
    <div className="relative rounded-xl overflow-hidden mb-8">
      {/* Background with gradient overlay */}
      <div className="h-80 bg-gradient-to-r from-purple-300 to-blue-300 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
          <h1 className="text-4xl font-bold mb-2">Talents Around Me</h1>
          <p className="text-xl mb-1">Discover hidden gems in your neighborhood!</p>
          
          <div className="mt-8 max-w-lg w-full mx-auto bg-white/20 backdrop-blur-sm rounded-full px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <MapPin className="h-5 w-5" />
              <p className="text-xl font-medium">
                There are <span className="font-bold text-2xl">{talentCount}</span> amazing talents within <span className="font-bold">{distance}km</span> of you.
              </p>
            </div>
            <p className="mb-4">Ready to meet them?</p>
            
            <Button className="group relative overflow-hidden rounded-full">
              <span className="relative z-10 flex items-center">
                Explore Now
                <Sparkles className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </Button>
          </div>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as 'map' | 'list')}>
              <TabsList className="bg-white/30 backdrop-blur-sm">
                <TabsTrigger value="map" className="data-[state=active]:bg-white">
                  <MapPin className="h-4 w-4 mr-2" />
                  Map View
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-white">
                  <Users className="h-4 w-4 mr-2" />
                  List View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentsHero;
