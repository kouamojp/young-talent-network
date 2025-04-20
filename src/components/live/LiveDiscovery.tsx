
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { streamCategories } from './data/liveData';
import { Globe, MapPin } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LiveStreamGrid from './LiveStreamGrid';

const LiveDiscovery: React.FC = () => {
  const [location, setLocation] = useState('everywhere');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const handleLocationChange = (value: string) => {
    setLocation(value);
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white/60 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Discover Live Streams</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Location
            </label>
            <Tabs defaultValue={location} onValueChange={handleLocationChange} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="everywhere" className="flex-1">Everywhere</TabsTrigger>
                <TabsTrigger value="nearme" className="flex-1">Near Me</TabsTrigger>
                <TabsTrigger value="custom" className="flex-1">Somewhere New...</TabsTrigger>
              </TabsList>
              <TabsContent value="custom" className="mt-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by city/country..." 
                    className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium mb-2">Content Categories</label>
            <Select defaultValue={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {streamCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {selectedCategory !== 'all' && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Subcategories</h3>
            <div className="flex flex-wrap gap-2">
              {streamCategories.find(c => c.id === selectedCategory)?.subcategories.map((sub, index) => (
                <Button key={index} variant="outline" size="sm" className="rounded-full">
                  {sub}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <LiveStreamGrid 
        title="Trending in Your Area"
        category={selectedCategory === 'all' ? undefined : selectedCategory}
        location={location}
      />
    </div>
  );
};

export default LiveDiscovery;
