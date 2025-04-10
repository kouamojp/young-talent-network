
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { talentCategories } from './TalentsData';
import { Search, MapPin, HeartHandshake, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TalentsFiltersProps {
  onFilterChange: (category: string, distance: number) => void;
}

const TalentsFilters: React.FC<TalentsFiltersProps> = ({ onFilterChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [distanceValue, setDistanceValue] = useState(5);
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onFilterChange(category, distanceValue);
  };
  
  const handleDistanceChange = (value: number[]) => {
    setDistanceValue(value[0]);
    onFilterChange(selectedCategory, value[0]);
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4 text-purple-600" />
              <span>Find someone who...</span>
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {talentCategories.map(category => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`cursor-pointer text-sm py-1 px-3 ${
                    selectedCategory === category.id 
                    ? "bg-primary hover:bg-primary/90" 
                    : "hover:bg-secondary/50"
                  }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.emoji} {category.name}
                </Badge>
              ))}
            </div>
            
            <div className="space-y-2 mt-5">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-purple-600" />
                <span>Skills you might like:</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="rounded-full">
                  🕺 ...can teach me hip-hop
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  🧪 ...wants to science-fair team up
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  🐶 ...also has a golden retriever
                </Button>
              </div>
            </div>
          </div>
          
          <div className="md:w-72 space-y-4 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span>Distance</span>
            </h3>
            
            <div className="px-2">
              <p className="text-sm mb-2">Show talents within: <span className="font-medium">{distanceValue}km</span></p>
              <div className="flex items-center gap-3">
                <span className="text-xs">🏡</span>
                <Slider
                  value={[distanceValue]}
                  min={1}
                  max={50}
                  step={1}
                  onValueChange={handleDistanceChange}
                />
                <span className="text-xs">🌆</span>
              </div>
            </div>
            
            <div className="mt-4 bg-blue-50 rounded p-3">
              <div className="flex items-start gap-2">
                <div className="text-blue-500 mt-1">🔒</div>
                <p className="text-xs text-blue-800">
                  <span className="font-medium">Safety First:</span> Precise location only shared when you message first
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TalentsFilters;
