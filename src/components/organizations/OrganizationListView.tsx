
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building, MapPin, Globe, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Organization {
  id: number;
  name: string;
  type: string;
  location: string;
  country: string;
  city: string;
  logo: string;
  description: string;
  rating: number;
  website: string;
  verified: boolean;
}

interface OrganizationListViewProps {
  organizations: Organization[];
}

const categories = ['All Types', 'Talent Agency', 'Production Company', 'Record Label', 'Educational Institution'];
const countries = ['All Countries', 'USA', 'UK', 'Canada', 'Australia'];
const cities = {
  'USA': ['All Cities', 'New York', 'Los Angeles', 'Chicago', 'Nashville'],
  'UK': ['All Cities', 'London', 'Manchester', 'Birmingham'],
  'Canada': ['All Cities', 'Toronto', 'Vancouver', 'Montreal'],
  'Australia': ['All Cities', 'Sydney', 'Melbourne', 'Brisbane'],
};

const OrganizationListView: React.FC<OrganizationListViewProps> = ({ organizations }) => {
  const [selectedCategory, setSelectedCategory] = React.useState('All Types');
  const [selectedCountry, setSelectedCountry] = React.useState('All Countries');
  const [selectedCity, setSelectedCity] = React.useState('All Cities');

  const filteredOrganizations = organizations.filter(org => {
    const categoryMatch = selectedCategory === 'All Types' || org.type === selectedCategory;
    const countryMatch = selectedCountry === 'All Countries' || org.country === selectedCountry;
    const cityMatch = selectedCity === 'All Cities' || org.city === selectedCity;
    return categoryMatch && countryMatch && cityMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map(country => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedCity} 
          onValueChange={setSelectedCity}
          disabled={selectedCountry === 'All Countries'}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            {(selectedCountry !== 'All Countries' ? cities[selectedCountry as keyof typeof cities] : ['All Cities']).map(city => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrganizations.map(org => (
          <Card key={org.id} className="hover:shadow-md transition-shadow">
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
                      {org.city}, {org.country}
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
    </div>
  );
};

export default OrganizationListView;
