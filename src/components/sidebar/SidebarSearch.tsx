
import React from 'react';
import { Search } from 'lucide-react';

const SidebarSearch: React.FC = () => {
  return (
    <div className="relative mt-4">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
      <input 
        type="text" 
        placeholder="Rechercher Y&T"
        className="w-full pl-8 pr-3 py-2 bg-white/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    </div>
  );
};

export default SidebarSearch;
