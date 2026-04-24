import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MapPin, Globe, Phone, Mail, Users, Award, Building, Star } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';

const sampleOrganizations = [
  { id: 1, name: 'Elite Talent Agency', type: 'Talent Agency', location: 'New York, USA', logo: '/placeholder.svg', description: 'Premier talent agency representing actors, musicians, and artists.', customDescription: 'Specializing in breakthrough talent discovery and career management.', rating: 4.8, verified: true, phone: '+1 (555) 123-4567', email: 'contact@elitetalent.com', website: 'www.elitetalent.com', recentlyAdded: true },
  { id: 2, name: 'Creative Arts Studio', type: 'Production Company', location: 'Los Angeles, USA', logo: '/placeholder.svg', description: 'Full-service production company specializing in film and TV.', rating: 4.7, verified: true, website: 'www.creativeartstudio.com', recentlyAdded: true },
  { id: 3, name: 'WebConsult Moscow', type: 'Web Services', location: 'Moscow, Russia', logo: '/placeholder.svg', description: 'Professional web development and digital marketing services.', customDescription: 'Я занимаюсь консалтингом в вебе. Создание и продвижение сайтов в Москве.', rating: 4.5, verified: true, website: 'www.webconsult.ru', recentlyAdded: false }
];

const OrganizationDiscovery: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredOrganizations = sampleOrganizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) || org.type.toLowerCase().includes(searchTerm.toLowerCase()) || org.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || (selectedFilter === 'recent' && org.recentlyAdded) || (selectedFilter === 'verified' && org.verified);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />{t('orgDisc.title')}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1"><Input placeholder={t('orgDisc.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="flex gap-2">
              <Button variant={selectedFilter === 'all' ? 'default' : 'outline'} onClick={() => setSelectedFilter('all')} size="sm">{t('orgDisc.all')}</Button>
              <Button variant={selectedFilter === 'recent' ? 'default' : 'outline'} onClick={() => setSelectedFilter('recent')} size="sm">{t('orgDisc.recentlyAdded')}</Button>
              <Button variant={selectedFilter === 'verified' ? 'default' : 'outline'} onClick={() => setSelectedFilter('verified')} size="sm">{t('orgDisc.verified')}</Button>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {t('orgDisc.found')} <strong>{filteredOrganizations.length}</strong> {filteredOrganizations.length === 1 ? t('orgDisc.organization') : t('orgDisc.organizations')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />{t('orgDisc.recentOrgs')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleOrganizations.filter(org => org.recentlyAdded).map(org => (
              <Card key={org.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12"><AvatarImage src={org.logo} alt={org.name} /><AvatarFallback>{org.name.charAt(0)}</AvatarFallback></Avatar>
                    <div className="flex-1"><h4 className="font-semibold">{org.name}</h4><p className="text-sm text-primary">{org.type}</p><div className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><MapPin className="h-3 w-3" />{org.location}</div></div>
                  </div>
                  <div className="mt-3 flex justify-between items-center"><Badge variant="secondary" className="text-xs">{t('orgDisc.new')}</Badge><Button size="sm" variant="outline">{t('orgDisc.connect')}</Button></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('orgDisc.allOrgs')}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrganizations.map(org => (
              <div key={org.id} className="border rounded-lg p-4">
                <div className="flex gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary"><AvatarImage src={org.logo} alt={org.name} /><AvatarFallback>{org.name.charAt(0)}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div><h3 className="font-bold text-lg">{org.name}</h3><p className="text-sm text-primary font-medium">{org.type}</p></div>
                      <Button size="sm" variant="outline" className="rounded-full"><MapPin className="h-3 w-3 mr-1" />{org.location}</Button>
                    </div>
                    {org.customDescription && (<div className="mt-2 p-2 bg-blue-50 rounded-md"><p className="text-sm font-medium text-blue-900">{org.customDescription}</p></div>)}
                    <p className="mt-2 text-sm line-clamp-2">{org.description}</p>
                    <div className="mt-3 flex gap-2">
                      {org.phone && (<Button size="sm" variant="outline" className="rounded-full text-xs" asChild><a href={`tel:${org.phone}`}><Phone className="h-3 w-3 mr-1" />{t('orgDisc.call')}</a></Button>)}
                      {org.email && (<Button size="sm" variant="outline" className="rounded-full text-xs" asChild><a href={`mailto:${org.email}`}><Mail className="h-3 w-3 mr-1" />{t('orgDisc.email')}</a></Button>)}
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="space-x-2">
                        <Button size="sm" className="rounded-full">{t('orgDisc.contact')}</Button>
                        <Button size="sm" variant="outline" className="rounded-full"><Users className="h-4 w-4 mr-1" />{t('orgDisc.viewProfileBtn')}</Button>
                      </div>
                      <div className="flex items-center gap-2">
                        {org.verified && (<Badge variant="outline" className="bg-blue-50"><Award className="h-3 w-3 mr-1" />{t('orgDisc.verified')}</Badge>)}
                        <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="text-sm font-medium">{org.rating}</span></div>
                        {org.website && (<Button size="sm" variant="ghost" asChild><a href={`https://${org.website}`} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4" /></a></Button>)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationDiscovery;
