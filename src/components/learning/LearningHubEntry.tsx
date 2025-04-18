
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, GraduationCap, Palette, BookOpen, Globe, MapPin } from 'lucide-react';
import GlassMorphism from '@/components/GlassMorphism';
import { categories } from './data/categories';

const LearningHubEntry: React.FC = () => {
  const navigate = useNavigate();

  const featuredCategories = categories.slice(0, 4);

  return (
    <GlassMorphism className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Y&T Learning Hub</h1>
        <p className="text-lg text-gray-600">Where Skills Grow Like Magic Beans 🌱✨</p>
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
            <h2 className="text-2xl font-bold">Explore Learning Adventures</h2>
            <p className="text-gray-600 mt-2">Discover courses to transform "I wish" into "I can"!</p>
          </div>
          <Button 
            onClick={() => navigate('/learning?path=explore')} 
            className="w-full py-6 text-lg h-auto group-hover:bg-purple-600 transition-colors"
          >
            Find Courses
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
            <h2 className="text-2xl font-bold">Share Your Expertise</h2>
            <p className="text-gray-600 mt-2">Create your own course and inspire others!</p>
          </div>
          <Button 
            onClick={() => navigate('/learning?path=create')} 
            className="w-full py-6 text-lg h-auto group-hover:bg-pink-600 transition-colors"
          >
            Create Course
          </Button>
        </div>
      </div>
      
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Learning Adventure Types</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/40 p-5 rounded-lg hover:shadow-md transition-all hover:bg-white/70 cursor-pointer">
            <div className="flex items-center mb-2">
              <Brain className="h-8 w-8 mr-3 text-purple-500" />
              <h3 className="text-lg font-semibold">Trainings</h3>
            </div>
            <p className="text-gray-600 text-sm italic mb-2">"Transform 'I wish' into 'I can'!"</p>
            <p className="text-sm">Interactive, hands-on skill development with expert guidance.</p>
          </div>
          
          <div className="bg-white/40 p-5 rounded-lg hover:shadow-md transition-all hover:bg-white/70 cursor-pointer">
            <div className="flex items-center mb-2">
              <GraduationCap className="h-8 w-8 mr-3 text-blue-500" />
              <h3 className="text-lg font-semibold">Seminars</h3>
            </div>
            <p className="text-gray-600 text-sm italic mb-2">"Wisdom nuggets from industry wizards!"</p>
            <p className="text-sm">Focused educational sessions on specialized topics.</p>
          </div>
          
          <div className="bg-white/40 p-5 rounded-lg hover:shadow-md transition-all hover:bg-white/70 cursor-pointer">
            <div className="flex items-center mb-2">
              <Palette className="h-8 w-8 mr-3 text-pink-500" />
              <h3 className="text-lg font-semibold">Masterclasses</h3>
            </div>
            <p className="text-gray-600 text-sm italic mb-2">"Steal secrets from the masters!"</p>
            <p className="text-sm">Advanced instruction from recognized leaders in their field.</p>
          </div>
          
          <div className="bg-white/40 p-5 rounded-lg hover:shadow-md transition-all hover:bg-white/70 cursor-pointer">
            <div className="flex items-center mb-2">
              <BookOpen className="h-8 w-8 mr-3 text-green-500" />
              <h3 className="text-lg font-semibold">Lectures</h3>
            </div>
            <p className="text-gray-600 text-sm italic mb-2">"Knowledge snacks for curious minds"</p>
            <p className="text-sm">Informative presentations on diverse subjects and theories.</p>
          </div>
        </div>
      </div>
      
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Categories</h2>
          <Button variant="link" onClick={() => navigate('/learning?path=explore')}>
            View All
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
              <p className="text-xs text-gray-600 mt-1">{category.subcategories.length} subcategories</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white/30 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Learning Modes</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-5 rounded-lg flex">
            <div className="mr-4">
              <Globe className="h-10 w-10 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Remote Learning</h3>
              <p className="text-gray-600 italic mb-2">"Pajama-friendly learning!"</p>
              <div className="text-sm">
                <div className="mb-1">• Private (1:1) Sessions</div>
                <div>• Group Learning Experiences</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-5 rounded-lg flex">
            <div className="mr-4">
              <MapPin className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">In-Person Learning</h3>
              <p className="text-gray-600 italic mb-2">"High-fives included!"</p>
              <div className="text-sm">
                <div className="mb-1">• Private (1:1) Sessions</div>
                <div>• Group Learning Experiences</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassMorphism>
  );
};

export default LearningHubEntry;
