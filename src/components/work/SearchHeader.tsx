
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ArrowLeft, Briefcase } from 'lucide-react';

interface SearchHeaderProps {
  path: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  path,
  searchTerm,
  onSearchChange,
  onBack
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Briefcase className="h-6 w-6" />
        <h1 className="text-2xl font-bold">
          {path === 'talent' ? "Find Your Dream Stage" : "Find Your Dream Team"}
        </h1>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            className="pl-10" 
            placeholder={path === 'talent' ? "Search for jobs, scholarships..." : "Search for talents, skills..."} 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button>
          Search
        </Button>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>
    </div>
  );
};

export default SearchHeader;
