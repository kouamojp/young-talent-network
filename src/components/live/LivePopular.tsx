
import React from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trendingStreams } from './data/liveData';
import LiveStreamGrid from './LiveStreamGrid';
import { Rocket, Diamond } from 'lucide-react';

const LivePopular: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          🔥 Popular NOW 
          <span className="text-sm font-normal text-gray-500">
            (Updated every minute)
          </span>
        </h2>
        
        <Carousel className="w-full">
          <CarouselContent>
            {trendingStreams.map((stream, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
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
                      {stream.badges.map((badge, i) => (
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
                      <h3 className="font-semibold text-lg mb-1">{stream.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>📍 {stream.location}</span>
                        <span>{stream.category}</span>
                      </div>
                      {stream.description && (
                        <p className="mt-2 text-sm text-gray-700">💬 "{stream.description}"</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
      
      <LiveStreamGrid title="Highest Rated Streams" limit={6} />
    </div>
  );
};

export default LivePopular;
