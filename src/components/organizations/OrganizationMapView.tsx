
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Globe, Users, Award, Building } from 'lucide-react';

interface Organization {
  id: number;
  name: string;
  type: string;
  location: string;
  logo: string;
  description: string;
  rating: number;
  website: string;
  verified: boolean;
}

interface OrganizationMapViewProps {
  organizations: Organization[];
  selectedOrg: number | null;
  setSelectedOrg: (id: number | null) => void;
}

const OrganizationMapView: React.FC<OrganizationMapViewProps> = ({
  organizations,
  selectedOrg,
  setSelectedOrg
}) => {
  const getMapPosition = (id: number) => {
    // This would be dynamic based on actual location data
    const positions: Record<number, {top: string, left: string}> = {
      1: { top: '30%', left: '45%' },
      2: { top: '40%', left: '55%' },
      3: { top: '50%', left: '30%' },
      4: { top: '60%', left: '70%' },
    };
    return positions[id] || { top: '50%', left: '50%' };
  };

  return (
    <div className="relative bg-blue-50 rounded-xl p-2 h-[500px] mb-8 overflow-hidden">
      <div className="absolute inset-0">
        {/* Map visualization elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-[80%] h-[1px] bg-blue-400 top-1/4 left-[10%]"></div>
          <div className="absolute w-[80%] h-[1px] bg-blue-400 top-2/4 left-[10%]"></div>
          <div className="absolute w-[80%] h-[1px] bg-blue-400 top-3/4 left-[10%]"></div>
          <div className="absolute w-[1px] h-[80%] bg-blue-400 left-1/4 top-[10%]"></div>
          <div className="absolute w-[1px] h-[80%] bg-blue-400 left-2/4 top-[10%]"></div>
          <div className="absolute w-[1px] h-[80%] bg-blue-400 left-3/4 top-[10%]"></div>
        </div>

        {/* Organization markers */}
        {organizations.map(org => {
          const position = getMapPosition(org.id);
          const isSelected = selectedOrg === org.id;

          return (
            <div key={org.id}>
              <button
                className={`absolute ${isSelected ? 'z-30' : 'z-20'} transition-all duration-300`}
                style={{ top: position.top, left: position.left }}
                onClick={() => setSelectedOrg(org.id)}
              >
                <div className={`
                  relative p-1.5 rounded-full 
                  ${isSelected ? 'bg-white shadow-lg' : 'bg-white/80'} 
                  transition-all duration-300
                  before:absolute before:inset-0 before:rounded-full before:animate-ping before:bg-primary/30 before:scale-150
                `}>
                  <Building className="h-5 w-5 text-purple-600" />
                </div>
              </button>
            </div>
          );
        })}

        {/* Selected organization info card */}
        {selectedOrg && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-full max-w-md px-4 z-40">
            {organizations.filter(org => org.id === selectedOrg).map(org => (
              <Card key={org.id} className="animate-fade-in shadow-lg">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarImage src={org.logo} alt={org.name} />
                      <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{org.name}</h3>
                          <p className="text-sm text-primary font-medium">{org.type}</p>
                        </div>
                        <Button size="sm" variant="outline" className="rounded-full">
                          <MapPin className="h-3 w-3 mr-1" />
                          {org.location}
                        </Button>
                      </div>

                      <p className="mt-2 text-sm line-clamp-2">{org.description}</p>

                      <div className="mt-3 flex justify-between items-center">
                        <div className="space-x-2">
                          <Button size="sm" className="rounded-full">
                            Contact
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-full">
                            <Users className="h-4 w-4 mr-1" />
                            View Talents
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          {org.verified && (
                            <div className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full flex items-center">
                              <Award className="h-3 w-3 mr-1" />
                              Verified
                            </div>
                          )}
                          <Button size="sm" variant="ghost" asChild>
                            <a href={`https://${org.website}`} target="_blank" rel="noopener noreferrer">
                              <Globe className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationMapView;
