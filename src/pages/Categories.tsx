
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import { Grid, Volleyball, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { categories, Subcategory, SubcategoryItem } from '@/components/learning/data/categories';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const Categories: React.FC = () => {
  const isMobile = useIsMobile();
  const [expandedCategories, setExpandedCategories] = useState<number[]>([1]); // Start with Sports expanded
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSubcategory = (categoryId: number, subcategoryName: string) => {
    const key = `${categoryId}-${subcategoryName}`;
    setExpandedSubcategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isSubcategoryExpanded = (categoryId: number, subcategoryName: string) => {
    const key = `${categoryId}-${subcategoryName}`;
    return expandedSubcategories[key];
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    subcategories: category.subcategories.map(subcategory => ({
      ...subcategory,
      items: subcategory.items.filter(item => 
        searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(subcategory => subcategory.items.length > 0)
  })).filter(category => category.subcategories.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-20 md:py-12 md:pt-24">
        <GlassMorphism className={`p-4 ${isMobile ? 'p-4' : 'p-6'} mb-6`}>
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <Grid className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>Categories & Thematic Sections</h1>
          </div>
          
          <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
            Browse and explore different talent categories and thematic sections. Find your area of interest and connect with like-minded talents.
          </p>
          
          <div className="relative flex mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search categories, subcategories, or skills..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredCategories.length > 0 ? (
            filteredCategories.map(category => (
              <GlassMorphism key={category.id} className={`${isMobile ? 'p-4' : 'p-6'} mb-6`}>
                <div 
                  className="flex items-center justify-between mb-4 cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 md:w-10 md:h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-lg md:text-xl">{category.icon}</span>
                    </div>
                    <h2 className="text-lg md:text-xl font-semibold">{category.name}</h2>
                  </div>
                  {expandedCategories.includes(category.id) ? 
                    <ChevronUp className="text-gray-500" /> : 
                    <ChevronDown className="text-gray-500" />
                  }
                </div>
                
                {expandedCategories.includes(category.id) && (
                  <div className="space-y-6">
                    {category.subcategories.map(subcategory => (
                      <div key={subcategory.name} className="bg-white/50 rounded-lg p-4">
                        <div 
                          className="flex justify-between items-center mb-3 cursor-pointer" 
                          onClick={() => toggleSubcategory(category.id, subcategory.name)}
                        >
                          <h3 className="font-medium text-base md:text-lg">{subcategory.name}</h3>
                          {isSubcategoryExpanded(category.id, subcategory.name) ? 
                            <ChevronUp className="text-gray-500 h-4 w-4" /> : 
                            <ChevronDown className="text-gray-500 h-4 w-4" />
                          }
                        </div>
                        <div 
                          className={cn(
                            "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3",
                            !isSubcategoryExpanded(category.id, subcategory.name) && "max-h-28 overflow-hidden"
                          )}
                        >
                          {subcategory.items.map((item, idx) => (
                            <div 
                              key={idx}
                              className="bg-white p-3 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-2"
                            >
                              <span className="text-xl">{item.icon}</span>
                              <p className="font-medium text-xs md:text-sm">{item.name}</p>
                            </div>
                          ))}
                        </div>
                        {subcategory.items.length > 10 && !isSubcategoryExpanded(category.id, subcategory.name) && (
                          <button
                            onClick={() => toggleSubcategory(category.id, subcategory.name)}
                            className="mt-2 text-xs md:text-sm text-primary hover:underline"
                          >
                            Show all {subcategory.items.length} items
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </GlassMorphism>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-lg text-gray-500">No categories found matching your search.</p>
              <button 
                className="mt-4 text-primary hover:underline"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </button>
            </div>
          )}
        </GlassMorphism>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
