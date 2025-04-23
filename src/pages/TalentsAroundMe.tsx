
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { TooltipProvider } from '@/components/ui/tooltip';
import TalentsHero from '@/components/talents/TalentsHero';
import TalentsList from '@/components/talents/TalentsList';
import TalentsMap from '@/components/talents/TalentsMap';
import TalentsFilters from '@/components/talents/TalentsFilters';
import { talentData } from '@/components/talents/TalentsData';

const TalentsAroundMe: React.FC = () => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [distance, setDistance] = useState<number>(5);
  const [selectedTalent, setSelectedTalent] = useState<number | null>(null);
  const [filteredTalents, setFilteredTalents] = useState(talentData);
  
  const handleFilterChange = (categoryFilter: string, distanceValue: number) => {
    setDistance(distanceValue);
    const filtered = talentData.filter(talent => 
      (categoryFilter === 'all' || talent.category === categoryFilter) && 
      talent.distance <= distanceValue
    );
    setFilteredTalents(filtered);
  };
  
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <Navbar />
        
        <div className="container mx-auto py-6 px-4">
          <TalentsHero 
            talentCount={filteredTalents.length} 
            distance={distance} 
            setViewMode={setViewMode} 
            viewMode={viewMode}
          />
          
          <TalentsFilters onFilterChange={handleFilterChange} />
          
          {viewMode === 'map' ? (
            <TalentsMap 
              talents={filteredTalents} 
              selectedTalent={selectedTalent}
              setSelectedTalent={setSelectedTalent}
            />
          ) : (
            <TalentsList 
              talents={filteredTalents} 
              selectedTalent={selectedTalent}
              setSelectedTalent={setSelectedTalent}
            />
          )}
          
          {filteredTalents.length === 0 && (
            <div className="mt-10 text-center p-10 bg-white rounded-lg shadow-sm max-w-xl mx-auto">
              <div className="text-6xl mb-4">🔭</div>
              <h3 className="text-xl font-medium mb-2">Hmm... quiet around here.</h3>
              <p className="text-gray-600 mb-4">Be the first to shine! 🚀<br />Or invite friends to join Y&T (they'll thank you later).</p>
              <button className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors">
                Invite Friends
              </button>
            </div>
          )}
        </div>
        
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default TalentsAroundMe;
