
import React from 'react';
import GlassMorphism from '@/components/GlassMorphism';
import { MapPin, User, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GeolocationTab: React.FC = () => {
  return (
    <GlassMorphism className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">
          <MapPin className="h-5 w-5 inline mr-2" />
          Geolocation
        </h3>
        <Button size="sm">
          Share Location
        </Button>
      </div>

      <Tabs defaultValue="map">
        <TabsList className="mb-4">
          <TabsTrigger value="map">Interactive Map</TabsTrigger>
          <TabsTrigger value="nearby">Nearby Talents</TabsTrigger>
          <TabsTrigger value="teams">Teams & Training Facilities</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <div className="aspect-video bg-gray-100 rounded-lg mb-4 relative">
            {/* This would be replaced with an actual map component */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Interactive Map</p>
                <p className="text-xs text-gray-400">This would display an interactive map showing your location and nearby connections</p>
              </div>
            </div>
            
            {/* Current location marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <User className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Your Current Location</h4>
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>New York City, NY, United States</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Last updated: Today, 3:45 PM</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nearby">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Sarah Johnson", sport: "Tennis", distance: "0.5 miles away" },
              { name: "David Chen", sport: "Soccer", distance: "1.2 miles away" },
              { name: "Maria Garcia", sport: "Swimming", distance: "1.8 miles away" },
              { name: "Tyler Williams", sport: "Basketball", distance: "2.1 miles away" }
            ].map((person, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    {person.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{person.name}</p>
                    <p className="text-sm text-gray-600">{person.sport}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{person.distance}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Connect</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-4">
            <Button variant="outline">
              View More Talents Around Me
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="teams">
          <div className="space-y-4">
            {[
              { 
                name: "NYC Basketball Academy", 
                type: "Training Facility",
                address: "123 Sports Ave, New York, NY",
                distance: "1.5 miles away",
                members: 28
              },
              { 
                name: "East Side Runners Club", 
                type: "Team",
                address: "45 Park Place, New York, NY",
                distance: "2.3 miles away",
                members: 16
              }
            ].map((team, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{team.name}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {team.type}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span>{team.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{team.members} members</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500">{team.distance}</span>
                    <div className="space-x-2">
                      <Button size="sm" variant="outline">Details</Button>
                      <Button size="sm">Join</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </GlassMorphism>
  );
};

export default GeolocationTab;
