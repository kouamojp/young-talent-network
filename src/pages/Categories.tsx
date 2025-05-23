
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import { Grid, ChevronDown, ChevronUp, Search, BarChart } from 'lucide-react';
import { categories, Subcategory, SubcategoryItem, athleteParameters } from '@/components/learning/data/categories';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Categories: React.FC = () => {
  const isMobile = useIsMobile();
  const [expandedCategories, setExpandedCategories] = useState<number[]>([1]); // Start with Sports expanded
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<"categories" | "profile">("categories");
  
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
          <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <Grid className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
              <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>Categories & Performance Tracking</h1>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "categories" | "profile")} className="hidden md:flex">
              <TabsList>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="profile">Athlete Profile</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Mobile tabs */}
          <div className="mb-6 md:hidden">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "categories" | "profile")}>
              <TabsList className="w-full">
                <TabsTrigger value="categories" className="flex-1">Categories</TabsTrigger>
                <TabsTrigger value="profile" className="flex-1">Athlete Profile</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Use a single Tabs component with single set of TabsContent */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "categories" | "profile")}>
            <TabsContent value="categories" className="mt-0">
              <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
                Browse categories with personalized performance tracking! Each sport comes with specific metrics to track your progress and improvement.
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
                              <div className="flex items-center">
                                <h3 className="font-medium text-base md:text-lg">{subcategory.name}</h3>
                                {subcategory.performanceMetrics && (
                                  <Badge variant="outline" className="ml-2 bg-emerald-50">New Metrics!</Badge>
                                )}
                              </div>
                              {isSubcategoryExpanded(category.id, subcategory.name) ? 
                                <ChevronUp className="text-gray-500 h-4 w-4" /> : 
                                <ChevronDown className="text-gray-500 h-4 w-4" />
                              }
                            </div>
                            
                            {/* Performance Metrics Section */}
                            {subcategory.performanceMetrics && (
                              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-4">
                                <div className="font-medium text-sm mb-2 flex items-center">
                                  <BarChart className="h-4 w-4 mr-1 text-blue-500" />
                                  <span>New! Performance Tracking</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {subcategory.performanceMetrics.map((metric, i) => (
                                    <div key={i} className="bg-white/80 p-2 rounded-md flex items-center">
                                      <span className="text-lg mr-2">{metric.icon}</span>
                                      <span className="text-xs md:text-sm">{metric.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSubcategory(category.id, subcategory.name);
                                }}
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
            </TabsContent>
            
            <TabsContent value="profile" className="mt-0">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2">🌟 Athlete Profile Hub</h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Track your performance across different sports and fitness activities
                </p>
              </div>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Performance Parameters</CardTitle>
                  <CardDescription>Track your progress against personal goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {athleteParameters.map((param, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{param.name}</span>
                          <span className="text-sm text-gray-500">{param.score}% / {param.goal}%</span>
                        </div>
                        <Progress value={param.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <GlassMorphism className="p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  Interactive Features
                </h3>
                
                {categories[0]?.performanceTracking?.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2 bg-white/50 p-2 rounded-md">
                    <span>{feature}</span>
                  </div>
                ))}
                
                <div className="mt-6 bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Why Users Love This:</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-amber-500">1.</span>
                      <span><strong>Personalized</strong> - Metrics adapt to each sport</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-amber-500">2.</span>
                      <span><strong>Gamified</strong> - Earn badges for milestones</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-amber-500">3.</span>
                      <span><strong>Social</strong> - Share progress on Lovable feeds</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-amber-500">4.</span>
                      <span><strong>Actionable</strong> - Get custom training tips</span>
                    </li>
                  </ul>
                </div>
              </GlassMorphism>
            </TabsContent>
          </Tabs>
        </GlassMorphism>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
