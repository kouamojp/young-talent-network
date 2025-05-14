
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import { Grid, Music, Film, Palette, Users, Code, Briefcase, Trophy, Theater, Mic, Dumbbell, Volleyball } from 'lucide-react';
import { categories } from '@/components/learning/data/categories';

const Categories: React.FC = () => {
  // Find the sports category from our categories data
  const sportsCategory = categories.find(category => category.name === 'Sports');
  
  const generalCategories = [
    { id: 1, name: 'Music', icon: Music, count: 1245 },
    { id: 2, name: 'Film & Photography', icon: Film, count: 872 },
    { id: 3, name: 'Art & Design', icon: Palette, count: 643 },
    { id: 4, name: 'Acting', icon: Theater, count: 643 },
    { id: 5, name: 'Dance', icon: Users, count: 789 },
    { id: 6, name: 'Technology', icon: Code, count: 512 },
    { id: 7, name: 'Writing', icon: Mic, count: 432 },
    { id: 8, name: 'Sports', icon: Dumbbell, count: 865 },
    { id: 9, name: 'Business', icon: Briefcase, count: 378 },
    { id: 10, name: 'Competitions', icon: Trophy, count: 246 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <GlassMorphism className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Grid className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Categories & Thematic Sections</h1>
          </div>
          
          <p className="text-gray-600 mb-8">
            Browse and explore different talent categories and thematic sections. Find your area of interest and connect with like-minded talents.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generalCategories.map(category => (
              <GlassMorphism key={category.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count} members</p>
                  </div>
                </div>
              </GlassMorphism>
            ))}
          </div>
        </GlassMorphism>
        
        {/* Sports Category Section */}
        {sportsCategory && (
          <GlassMorphism className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Volleyball className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Sports Categories</h2>
            </div>
            
            <div className="bg-white/50 p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${sportsCategory.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-xl">{sportsCategory.icon}</span>
                </div>
                <h3 className="text-lg font-medium">{sportsCategory.name}</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
                {sportsCategory.subcategories.map((sport, index) => (
                  <div 
                    key={index} 
                    className="bg-white p-3 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <p className="font-medium text-sm text-center">{sport}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassMorphism>
        )}
        
        <GlassMorphism className="p-6">
          <h2 className="text-xl font-semibold mb-4">Featured Thematic Section</h2>
          
          <div className="bg-primary/5 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Music Production Workshop Series</h3>
            <p className="text-gray-600 mb-3">
              Join our music production workshop series featuring industry professionals who will guide you through the process of creating and producing music.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs px-2 py-1 bg-primary/10 rounded-full">Music</span>
              <span className="text-xs px-2 py-1 bg-primary/10 rounded-full">Production</span>
              <span className="text-xs px-2 py-1 bg-primary/10 rounded-full">Workshop</span>
            </div>
            
            <button className="text-primary hover:underline text-sm">Learn more</button>
          </div>
        </GlassMorphism>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
