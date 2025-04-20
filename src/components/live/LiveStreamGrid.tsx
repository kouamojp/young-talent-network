
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Diamond } from 'lucide-react';
import { liveStreams } from './data/liveData';

interface LiveStreamGridProps {
  title?: string;
  category?: string;
  location?: string;
  query?: string;
  limit?: number;
}

const LiveStreamGrid: React.FC<LiveStreamGridProps> = ({ 
  title, 
  category, 
  location, 
  query,
  limit = 9 
}) => {
  // In a real app, we would filter based on the props
  // Here we're just using the mock data
  const streams = liveStreams.slice(0, limit);
  
  return (
    <div>
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {streams.map((stream, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div className="relative">
              <img 
                src={stream.thumbnail} 
                alt={stream.title}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                LIVE
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                {stream.viewers.toLocaleString()} watching
              </div>
              {stream.badges && stream.badges.map((badge, i) => (
                <div key={i} className="absolute top-2 right-2">
                  <Badge 
                    className={`flex items-center gap-1 ${
                      badge === 'rising' ? 'bg-orange-500' : 'bg-purple-500'
                    }`}
                  >
                    {badge === 'rising' ? (
                      <>
                        <Rocket className="h-3 w-3" />
                        <span>Rising Star</span>
                      </>
                    ) : (
                      <>
                        <Diamond className="h-3 w-3" />
                        <span>Editor's Pick</span>
                      </>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">{stream.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>📍 {stream.location}</span>
                <span>{stream.category}</span>
              </div>
              {stream.description && (
                <p className="mt-2 text-sm text-gray-700">💬 "{stream.description}"</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LiveStreamGrid;
