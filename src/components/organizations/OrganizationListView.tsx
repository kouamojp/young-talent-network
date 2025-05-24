
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building, MapPin, Globe, Users, Award, Phone, Mail, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Organization {
  id: number;
  name: string;
  type: string;
  location: string;
  country: string;
  city: string;
  logo: string;
  description: string;
  customDescription?: string;
  rating: number;
  website: string;
  verified: boolean;
  phone?: string;
  email?: string;
}

interface OrganizationListViewProps {
  organizations: Organization[];
  onEditOrganization?: (org: Organization) => void;
}

const categories = ['All Types', 'Talent Agency', 'Production Company', 'Record Label', 'Educational Institution', 'Consulting', 'Web Services'];
const countries = ['All Countries', 'USA', 'UK', 'Canada', 'Australia', 'Russia', 'Germany'];
const cities = {
  'USA': ['All Cities', 'New York', 'Los Angeles', 'Chicago', 'Nashville'],
  'UK': ['All Cities', 'London', 'Manchester', 'Birmingham'],
  'Canada': ['All Cities', 'Toronto', 'Vancouver', 'Montreal'],
  'Australia': ['All Cities', 'Sydney', 'Melbourne', 'Brisbane'],
  'Russia': ['All Cities', 'Moscow', 'St. Petersburg', 'Novosibirsk'],
  'Germany': ['All Cities', 'Berlin', 'Munich', 'Hamburg']
};

const OrganizationListView: React.FC<OrganizationListViewProps> = ({ 
  organizations, 
  onEditOrganization 
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState('All Types');
  const [selectedCountry, setSelectedCountry] = React.useState('All Countries');
  const [selectedCity, setSelectedCity] = React.useState('All Cities');

  const filteredOrganizations = organizations.filter(org => {
    const categoryMatch = selectedCategory === 'All Types' || org.type === selectedCategory;
    const countryMatch = selectedCountry === 'All Countries' || org.country === selectedCountry;
    const cityMatch = selectedCity === 'All Cities' || org.city === selectedCity;
    return categoryMatch && countryMatch && cityMatch;
  });

  const getCountryName = (countryCode: string) => {
    const countryMap: { [key: string]: string } = {
      'USA': 'United States',
      'UK': 'United Kingdom',
      'Canada': 'Canada',
      'Australia': 'Australia',
      'Russia': 'Russia',
      'Germany': 'Germany'
    };
    return countryMap[countryCode] || countryCode;
  };

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
                {country === 'All Countries' ? country : getCountryName(country)}
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
                    <div className="flex gap-1">
                      {onEditOrganization && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => onEditOrganization(org)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="rounded-full">
                        <MapPin className="h-3 w-3 mr-1" />
                        {org.city}, {getCountryName(org.country)}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Custom Description */}
                  {org.customDescription && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-md">
                      <p className="text-sm font-medium text-blue-900">{org.customDescription}</p>
                    </div>
                  )}
                  
                  <p className="mt-2 text-sm line-clamp-2">{org.description}</p>
                  
                  {/* Contact Information */}
                  <div className="mt-3 flex gap-2">
                    {org.phone && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-full text-xs"
                        asChild
                      >
                        <a href={`tel:${org.phone}`}>
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </a>
                      </Button>
                    )}
                    {org.email && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-full text-xs"
                        asChild
                      >
                        <a href={`mailto:${org.email}`}>
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </a>
                      </Button>
                    )}
                  </div>
                  
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
                        <Badge variant="outline" className="bg-blue-50">
                          <Award className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {org.website && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={`https://${org.website}`} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
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
