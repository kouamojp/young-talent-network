
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mic, MicOff } from 'lucide-react';
import LiveStreamGrid from './LiveStreamGrid';

const LiveSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    'dance classes', 'piano tutorials', 'soccer skills', 'painting for beginners'
  ]);
  const [isListening, setIsListening] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
      setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
    }
    // In a real app, we would perform the search here
  };
  
  const handleVoiceSearch = () => {
    setIsListening(!isListening);
    
    // Simulating voice recognition in a real app
    if (!isListening) {
      setTimeout(() => {
        setSearchQuery('ballet streams in Paris');
        setIsListening(false);
      }, 2000);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white/60 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5" /> 
          Smart Search
        </h2>
        
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Find talent streams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            <Button type="button" variant="outline" onClick={handleVoiceSearch}>
              {isListening ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button type="submit">Search</Button>
          </div>
        </form>
        
        {isListening && (
          <div className="text-center p-3 rounded-md bg-blue-50 text-blue-800 mb-4">
            Listening... Speak now
          </div>
        )}
        
        <div>
          <h3 className="text-sm font-medium mb-2">Recent Searches</h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Button
                key={index}
                variant="outline"
                className="rounded-full bg-gradient-to-r from-purple-50 to-blue-50"
                onClick={() => setSearchQuery(search)}
              >
                {search}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <LiveStreamGrid title="Search Results" query={searchQuery} />
    </div>
  );
};

export default LiveSearch;
