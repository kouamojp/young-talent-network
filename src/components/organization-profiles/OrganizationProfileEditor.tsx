
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Upload, 
  Edit, 
  Plus, 
  X, 
  Phone, 
  Mail, 
  Globe, 
  MapPin,
  Users,
  Briefcase
} from 'lucide-react';
import ImageEditor from './ImageEditor';
import StaffManager from './StaffManager';
import JobPostingsManager from './JobPostingsManager';
import { countries } from '@/data/countries';

const OrganizationProfileEditor: React.FC = () => {
  const [organizationData, setOrganizationData] = useState({
    name: 'Elite Talent Agency',
    description: 'Premier talent agency representing actors, musicians, and artists across various industries.',
    customDescription: 'Specializing in breakthrough talent discovery and career management for entertainment professionals.',
    logo: '/placeholder.svg',
    coverImage: '/placeholder.svg',
    email: 'contact@elitetalent.com',
    phone: '+1 (555) 123-4567',
    website: 'www.elitetalent.com',
    country: 'United States',
    city: 'New York',
    address: '123 Broadway, New York, NY 10001',
    addDirections: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState<'logo' | 'cover' | null>(null);

  const handleSave = () => {
    setIsEditing(false);
    console.log('Saving organization data:', organizationData);
  };

  const handleImageUpload = (type: 'logo' | 'cover', file: File) => {
    const url = URL.createObjectURL(file);
    setOrganizationData(prev => ({
      ...prev,
      [type === 'logo' ? 'logo' : 'coverImage']: url
    }));
  };

  const handleEditImage = (type: 'logo' | 'cover') => {
    setEditingImage(type);
    setShowImageEditor(true);
  };

  return (
    <div className="space-y-6">
      {/* Cover Image Section */}
      <Card>
        <div className="relative h-48 bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-lg overflow-hidden">
          <img 
            src={organizationData.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => handleEditImage('cover')}
              className="bg-white/80 hover:bg-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Cover
            </Button>
          </div>
          
          {/* Logo positioned over cover */}
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={organizationData.logo} alt={organizationData.name} />
                <AvatarFallback className="text-xl">{organizationData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleEditImage('logo')}
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <CardContent className="pt-16">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{organizationData.name}</h2>
              <Badge variant="outline" className="mt-1">Verified Organization</Badge>
            </div>
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "default" : "outline"}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="jobs">Vacancies</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input 
                    id="org-name"
                    value={organizationData.name}
                    onChange={(e) => setOrganizationData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-website">Website</Label>
                  <Input 
                    id="org-website"
                    value={organizationData.website}
                    onChange={(e) => setOrganizationData(prev => ({ ...prev, website: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-description">Custom Description</Label>
                <Textarea 
                  id="custom-description"
                  placeholder="Describe your services, specializations, or unique value proposition..."
                  value={organizationData.customDescription}
                  onChange={(e) => setOrganizationData(prev => ({ ...prev, customDescription: e.target.value }))}
                  disabled={!isEditing}
                  className="min-h-20"
                />
                <p className="text-xs text-muted-foreground">
                  Example: "Web consulting: Website development & SEO in Moscow"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Standard Description</Label>
                <Textarea 
                  id="description"
                  value={organizationData.description}
                  onChange={(e) => setOrganizationData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={!isEditing}
                  className="min-h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country"
                    value={organizationData.country}
                    onChange={(e) => setOrganizationData(prev => ({ ...prev, country: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Type country name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city"
                    value={organizationData.city}
                    onChange={(e) => setOrganizationData(prev => ({ ...prev, city: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Type city name..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input 
                  id="address"
                  value={organizationData.address}
                  onChange={(e) => setOrganizationData(prev => ({ ...prev, address: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="email"
                      type="email"
                      value={organizationData.email}
                      onChange={(e) => setOrganizationData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                    <Button size="sm" variant="outline" asChild>
                      <a href={`mailto:${organizationData.email}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="phone"
                      value={organizationData.phone}
                      onChange={(e) => setOrganizationData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${organizationData.phone}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="directions"
                  checked={organizationData.addDirections}
                  onChange={(e) => setOrganizationData(prev => ({ ...prev, addDirections: e.target.checked }))}
                  disabled={!isEditing}
                />
                <Label htmlFor="directions">Add driving directions (auto-generated map)</Label>
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <StaffManager />
        </TabsContent>

        <TabsContent value="jobs">
          <JobPostingsManager />
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Media Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Photo gallery and media management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Image Editor Modal */}
      {showImageEditor && editingImage && (
        <ImageEditor
          isOpen={showImageEditor}
          onClose={() => {
            setShowImageEditor(false);
            setEditingImage(null);
          }}
          imageType={editingImage}
          onSave={(processedImage) => {
            setOrganizationData(prev => ({
              ...prev,
              [editingImage === 'logo' ? 'logo' : 'coverImage']: processedImage
            }));
            setShowImageEditor(false);
            setEditingImage(null);
          }}
        />
      )}
    </div>
  );
};

export default OrganizationProfileEditor;
