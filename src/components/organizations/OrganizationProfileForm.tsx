
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { countries } from '@/data/countries';
import { Edit, Upload, Settings, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface OrganizationFormData {
  name: string;
  type: string;
  description: string;
  customDescription: string;
  website: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  address: string;
}

interface OrganizationProfileFormProps {
  organization?: any;
  onSave: (data: OrganizationFormData) => void;
  onCancel: () => void;
}

const OrganizationProfileForm: React.FC<OrganizationProfileFormProps> = ({
  organization,
  onSave,
  onCancel
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(organization?.logo || '/placeholder.svg');
  const [imageSettings, setImageSettings] = useState({
    quality: 80,
    maxWidth: 200,
    maxHeight: 200
  });

  const form = useForm<OrganizationFormData>({
    defaultValues: {
      name: organization?.name || '',
      type: organization?.type || '',
      description: organization?.description || '',
      customDescription: organization?.customDescription || '',
      website: organization?.website || '',
      phone: organization?.phone || '',
      email: organization?.email || '',
      country: organization?.country || '',
      city: organization?.city || '',
      address: organization?.address || ''
    }
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageCompress = () => {
    if (!logoFile) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = imageSettings.maxWidth;
      canvas.height = imageSettings.maxHeight;
      ctx?.drawImage(img, 0, 0, imageSettings.maxWidth, imageSettings.maxHeight);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], logoFile.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          setLogoFile(compressedFile);
          setLogoPreview(canvas.toDataURL('image/jpeg', imageSettings.quality / 100));
        }
      }, 'image/jpeg', imageSettings.quality / 100);
    };
    
    img.src = logoPreview;
  };

  const onSubmit = (data: OrganizationFormData) => {
    onSave(data);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Organization Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo Management Section */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Logo & Image Management</Label>
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage src={logoPreview} alt="Organization logo" />
                    <AvatarFallback>{form.watch('name')?.charAt(0) || 'O'}</AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex-1 space-y-3">
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Max Width (px)</Label>
                      <Input
                        type="number"
                        value={imageSettings.maxWidth}
                        onChange={(e) => setImageSettings(prev => ({
                          ...prev,
                          maxWidth: parseInt(e.target.value) || 200
                        }))}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Max Height (px)</Label>
                      <Input
                        type="number"
                        value={imageSettings.maxHeight}
                        onChange={(e) => setImageSettings(prev => ({
                          ...prev,
                          maxHeight: parseInt(e.target.value) || 200
                        }))}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Quality: {imageSettings.quality}%</Label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={imageSettings.quality}
                      onChange={(e) => setImageSettings(prev => ({
                        ...prev,
                        quality: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>
                  
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleImageCompress}
                    disabled={!logoFile}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Apply Image Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter organization name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Talent Agency">Talent Agency</SelectItem>
                        <SelectItem value="Production Company">Production Company</SelectItem>
                        <SelectItem value="Record Label">Record Label</SelectItem>
                        <SelectItem value="Educational Institution">Educational Institution</SelectItem>
                        <SelectItem value="Consulting">Consulting</SelectItem>
                        <SelectItem value="Web Services">Web Services</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Custom Description Field */}
            <FormField
              control={form.control}
              name="customDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Specialization Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your services and specializations (e.g., 'Я занимаюсь консалтингом в вебе. Создание и продвижение сайтов в Москве.')"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Highlight your services and specializations in your own words
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Standard Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Standard Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter organization description"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@organization.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="www.organization.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Combobox
                        options={countries}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select or search country"
                        searchPlaceholder="Search countries..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OrganizationProfileForm;
