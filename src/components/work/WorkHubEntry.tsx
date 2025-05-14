
import React from 'react';
import { Button } from '@/components/ui/button';
import { Briefcase, MicIcon, Building, SparklesIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassMorphism from '@/components/GlassMorphism';

const WorkHubEntry: React.FC = () => {
  const navigate = useNavigate();

  return (
    <GlassMorphism className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Y&T Work Hub</h1>
        <p className="text-lg text-gray-600">Where dreams meet opportunities</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div 
          className="group bg-gradient-to-br from-blue-50 to-purple-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <div className="text-center mb-4">
            <div className="inline-block p-4 bg-white/60 rounded-full mb-4 transition-all">
              <Building className="h-12 w-12 text-blue-600 group-hover:hidden" />
              <SparklesIcon className="h-12 w-12 text-purple-600 hidden group-hover:block" />
            </div>
            <h2 className="text-2xl font-bold">Find Your Dream Team</h2>
            <p className="text-gray-600 mt-2">Discover talents who'll make your heart skip a beat!</p>
          </div>
          <Button 
            onClick={() => navigate('/work?path=organization')} 
            className="w-full py-6 text-lg h-auto group-hover:bg-purple-600 transition-colors"
          >
            For Organizations
          </Button>
        </div>
        
        <div 
          className="group bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <div className="text-center mb-4">
            <div className="inline-block p-4 bg-white/60 rounded-full mb-4">
              <MicIcon className="h-12 w-12 text-purple-600 group-hover:hidden" />
              <Briefcase className="h-12 w-12 text-pink-600 hidden group-hover:block" />
            </div>
            <h2 className="text-2xl font-bold">Find Your Dream Stage</h2>
            <p className="text-gray-600 mt-2">Your next adventure starts here!</p>
          </div>
          <Button 
            onClick={() => navigate('/work?path=talent')} 
            className="w-full py-6 text-lg h-auto group-hover:bg-pink-600 transition-colors"
          >
            For Talents
          </Button>
        </div>
      </div>
      
      <div className="mt-10 bg-white/30 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Success Stories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white/60 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                <img 
                  src="/placeholder.svg" 
                  alt="Success story" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold">From Passion to Profession</h4>
                <p className="text-sm text-gray-600 mt-1">
                  How I found my dream opportunity through Y&T Work Hub
                </p>
                <Button variant="link" className="px-0 mt-2">
                  Read Full Story
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassMorphism>
  );
};

export default WorkHubEntry;
