import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const recentOrganizations = [
  {
    id: 1,
    name: 'Elite Talent Agency',
    type: 'Talent Agency',
    location: 'New York, USA',
    logo: '/placeholder.svg',
    description: 'Premier talent agency representing actors, musicians, and artists.',
  },
  {
    id: 2,
    name: 'Creative Arts Studio',
    type: 'Production Company',
    location: 'Los Angeles, USA',
    logo: '/placeholder.svg',
    description: 'Full-service production company specializing in film and TV.',
  },
  {
    id: 3,
    name: 'WebConsult Moscow',
    type: 'Web Services',
    location: 'Moscow, Russia',
    logo: '/placeholder.svg',
    description: 'Professional web development and digital marketing services.',
  }
];

const RecentOrganizations: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Recently Added Organizations
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/organizations')}>
          View All
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentOrganizations.map((org) => (
            <Card key={org.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={org.logo} alt={org.name} />
                    <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{org.name}</h4>
                    <p className="text-xs text-primary">{org.type}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{org.location}</span>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{org.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">New</Badge>
                  <Button size="sm" variant="outline" onClick={() => navigate('/organizations')}>
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrganizations;