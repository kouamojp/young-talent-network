
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, GraduationCap, Palette, BookOpen, Globe, MapPin } from 'lucide-react';
import GlassMorphism from '@/components/GlassMorphism';
import { categories } from './data/categories';
import { tr } from '@/i18n';

const LearningHubEntry: React.FC = () => {
  const navigate = useNavigate();

  const featuredCategories = categories.slice(0, 4);

  return (
    <GlassMorphism className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{tr('learningHubEntry.yTLearningHub')}</h1>
        <p className="text-lg text-gray-600">{tr('learning.subtitle')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div 
          className="group bg-gradient-to-br from-blue-50 to-purple-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
          onClick={() => navigate('/learning?path=explore')}
        >
          <div className="text-center mb-4 cursor-pointer">
            <div className="inline-block p-4 bg-white/60 rounded-full mb-4 transition-all">
              <Brain className="h-12 w-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold">{tr('learningHubEntry.exploreLearningAdventures')}</h2>
            <p className="text-gray-600 mt-2">{tr('learning.exploreDesc')}</p>
          </div>
          <Button 
            onClick={() => navigate('/learning?path=explore')} 
            className="w-full py-6 text-lg h-auto group-hover:bg-purple-600 transition-colors"
          >
            {tr('learningHubEntry.findCourses')}
          </Button>
        </div>
        
        <div 
          className="group bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
          onClick={() => navigate('/learning?path=create')}
        >
          <div className="text-center mb-4 cursor-pointer">
            <div className="inline-block p-4 bg-white/60 rounded-full mb-4">
              <GraduationCap className="h-12 w-12 text-pink-600" />
            </div>
            <h2 className="text-2xl font-bold">{tr('learningHubEntry.shareYourExpertise')}</h2>
            <p className="text-gray-600 mt-2">{tr('learning.shareDesc')}</p>
          </div>
          <Button 
            onClick={() => navigate('/learning?path=create')} 
            className="w-full py-6 text-lg h-auto group-hover:bg-pink-600 transition-colors"
          >
            {tr('learningHubEntry.createCourse')}
          </Button>
        </div>
      </div>
      
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">{tr('learningHubEntry.learningAdventureTypes')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/40 p-5 rounded-lg hover:shadow-md transition-all hover:bg-white/70 cursor-pointer">
            <div className="flex items-center mb-2">
              <Brain className="h-8 w-8 mr-3 text-purple-500" />
              <h3 className="text-lg font-semibold">{tr('learning.trainings')}</h3>
            </div>
            <p className="text-gray-600 text-sm italic mb-2">{tr('learningHubEntry.transformIWishIntoICan')}</p>
            <p className="text-sm">{tr('learningHubEntry.interactiveHandsOnSkillDevelopmentWith')}</p>
          </div>
          
          <div className="bg-white/40 p-5 rounded-lg hover:shadow-md transition-all hover:bg-white/70 cursor-pointer">
            <div className="flex items-center mb-2">
              <GraduationCap className="h-8 w-8 mr-3 text-blue-500" />
              <h3 className="text-lg font-semibold">{tr('learning.seminars')}</h3>
            </div>
            <p className="text-gray-600 text-sm italic mb-2">{tr('learningHubEntry.wisdomNuggetsFromIndustryWizards')}</p>
            <p className="text-sm">{tr('learningHubEntry.focusedEducationalSessionsOnSpecializedTopic')}</p>
          </div>
          
          <div className="bg-white/40 p-5 rounded-lg hover:shadow-md transition-all hover:bg-white/70 cursor-pointer">
            <div className="flex items-center mb-2">
              <Palette className="h-8 w-8 mr-3 text-pink-500" />
              <h3 className="text-lg font-semibold">{tr('learning.masterclasses')}</h3>
            </div>
            <p className="text-gray-600 text-sm italic mb-2">{tr('learningHubEntry.stealSecretsFromTheMasters')}</p>
            <p className="text-sm">{tr('learningHubEntry.advancedInstructionFromRecognizedLeadersIn')}</p>
          </div>
          
          <div className="bg-white/40 p-5 rounded-lg hover:shadow-md transition-all hover:bg-white/70 cursor-pointer">
            <div className="flex items-center mb-2">
              <BookOpen className="h-8 w-8 mr-3 text-green-500" />
              <h3 className="text-lg font-semibold">{tr('learning.lectures')}</h3>
            </div>
            <p className="text-gray-600 text-sm italic mb-2">{tr('learningHubEntry.knowledgeSnacksForCuriousMinds')}</p>
            <p className="text-sm">{tr('learningHubEntry.informativePresentationsOnDiverseSubjectsAnd')}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{tr('landing.categories')}</h2>
          <Button variant="link" onClick={() => navigate('/learning?path=explore')}>
            {tr('learningHubEntry.viewAll')}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredCategories.map((category) => (
            <div 
              key={category.id}
              className={`${category.color} p-4 rounded-lg text-center hover:shadow-md transition-all cursor-pointer`}
              onClick={() => navigate(`/learning?path=explore&category=${category.name.toLowerCase()}`)}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-xs text-gray-600 mt-1">{category.subcategories.length} {tr('learning.subcategories')}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white/30 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{tr('learningHubEntry.learningModes')}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-5 rounded-lg flex">
            <div className="mr-4">
              <Globe className="h-10 w-10 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{tr('learningHubEntry.remoteLearning')}</h3>
              <p className="text-gray-600 italic mb-2">{tr('learningHubEntry.pajamaFriendlyLearning')}</p>
              <div className="text-sm">
                <div className="mb-1">{tr('learningHubEntry.private11Sessions')}</div>
                <div>{tr('learningHubEntry.groupLearningExperiences')}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-5 rounded-lg flex">
            <div className="mr-4">
              <MapPin className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{tr('learningHubEntry.inPersonLearning')}</h3>
              <p className="text-gray-600 italic mb-2">{tr('learningHubEntry.highFivesIncluded')}</p>
              <div className="text-sm">
                <div className="mb-1">{tr('learningHubEntry.private11Sessions')}</div>
                <div>{tr('learningHubEntry.groupLearningExperiences')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassMorphism>
  );
};

export default LearningHubEntry;
