
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { ArrowLeft, GraduationCap, Upload, Calendar, Clock, Globe, MapPin, DollarSign, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from './data/categories';

interface LearningCreateProps {
  onBack: () => void;
}

const LearningCreate: React.FC<LearningCreateProps> = ({ onBack }) => {
  const form = useForm();
  
  const locationTypes = [
    { value: 'remote', label: 'Remote (Pajama-friendly learning!)' },
    { value: 'in-person', label: 'In-Person (High-fives included!)' },
    { value: 'hybrid', label: 'Hybrid (Best of both worlds!)' }
  ];
  
  const learningTypes = [
    { value: 'training', label: 'Training', description: 'Transform "I wish" into "I can"!' },
    { value: 'seminar', label: 'Seminar', description: 'Wisdom nuggets from industry wizards!' },
    { value: 'masterclass', label: 'Masterclass', description: 'Steal secrets from the masters!' },
    { value: 'lecture', label: 'Lecture', description: 'Knowledge snacks for curious minds' }
  ];
  
  const handleSubmit = (data: any) => {
    console.log('Form data:', data);
    // Submit to API would go here
  };
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <GraduationCap className="h-6 w-6" />
        <h1 className="text-2xl font-bold">
          Create Learning Adventure
        </h1>
      </div>
      
      <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="bg-white/60 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">1. Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <FormLabel htmlFor="title">Title</FormLabel>
              <FormDescription>Make it catchy! What would make YOU click?</FormDescription>
              <Input 
                id="title"
                placeholder="e.g. From Shy to Shining: 3-Day Confidence Bootcamp"
                {...form.register('title')}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel htmlFor="learning-type">Learning Adventure Type</FormLabel>
                <Select 
                  onValueChange={(value) => form.setValue('learningType', value)}
                  defaultValue=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {learningTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div>{type.label}</div>
                          <div className="text-xs text-gray-500 italic">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <FormLabel htmlFor="instructor">Instructor Name</FormLabel>
                <Input 
                  id="instructor"
                  placeholder="e.g. Dr. Jane Smith"
                  {...form.register('instructor')}
                />
              </div>
            </div>
            
            <div>
              <FormLabel htmlFor="description">Description</FormLabel>
              <FormDescription>Tell learners what makes your adventure special!</FormDescription>
              <Textarea 
                id="description"
                placeholder="Describe your learning adventure in detail..."
                className="min-h-32"
                {...form.register('description')}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">2. Category & Location</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel htmlFor="category">Category</FormLabel>
                <Select 
                  onValueChange={(value) => form.setValue('category', value)}
                  defaultValue=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name.toLowerCase()}>
                        <div className="flex items-center">
                          <span className="mr-2">{category.icon}</span>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <FormLabel htmlFor="subcategory">Subcategory</FormLabel>
                <Input 
                  id="subcategory"
                  placeholder="e.g. Public Speaking, Guitar, Coding"
                  {...form.register('subcategory')}
                />
              </div>
            </div>
            
            <div>
              <FormLabel htmlFor="location-type">Location Setting</FormLabel>
              <FormDescription>Where's the magic happening?</FormDescription>
              <Select 
                onValueChange={(value) => form.setValue('locationType', value)}
                defaultValue=""
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  {locationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        {type.value === 'remote' ? (
                          <Globe className="mr-2 h-4 w-4" />
                        ) : (
                          <MapPin className="mr-2 h-4 w-4" />
                        )}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <FormLabel htmlFor="address">Venue Address</FormLabel>
              <FormDescription>Only needed for in-person or hybrid events</FormDescription>
              <Input 
                id="address"
                placeholder="e.g. 123 Creativity Lane, New York, NY"
                {...form.register('address')}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">3. Logistics & Media</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <FormLabel htmlFor="start-date">Start Date</FormLabel>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="start-date"
                    type="date"
                    className="pl-10"
                    {...form.register('startDate')}
                  />
                </div>
              </div>
              
              <div>
                <FormLabel htmlFor="duration">Duration</FormLabel>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="duration"
                    placeholder="e.g. 2 hours, 3 days"
                    className="pl-10"
                    {...form.register('duration')}
                  />
                </div>
              </div>
              
              <div>
                <FormLabel htmlFor="price">Price</FormLabel>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="price"
                    placeholder="e.g. 49.99"
                    className="pl-10"
                    {...form.register('price')}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel htmlFor="max-participants">Maximum Participants</FormLabel>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="max-participants"
                    type="number"
                    placeholder="e.g. 20"
                    className="pl-10"
                    {...form.register('maxParticipants')}
                  />
                </div>
              </div>
              
              <div>
                <FormLabel htmlFor="skill-level">Skill Level</FormLabel>
                <Select 
                  onValueChange={(value) => form.setValue('skillLevel', value)}
                  defaultValue=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (No experience needed)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (Some experience helpful)</SelectItem>
                    <SelectItem value="advanced">Advanced (Experienced learners)</SelectItem>
                    <SelectItem value="all-levels">All Levels Welcome</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <FormLabel htmlFor="media">Upload Media</FormLabel>
              <FormDescription>Pro tip: Photos with natural light get 2x more signups!</FormDescription>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-600 mb-2">Drag and drop your files here, or click to browse</p>
                <Button type="button" variant="outline" size="sm">
                  Choose Files
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">4. Extra Magic Dust</h2>
          
          <div className="space-y-4">
            <div>
              <FormLabel htmlFor="requirements">Special Requirements</FormLabel>
              <FormDescription>Will there be snacks? Do participants need to bring anything?</FormDescription>
              <Textarea 
                id="requirements"
                placeholder="e.g. Please bring a notebook and pen. Snacks will be provided!"
                {...form.register('requirements')}
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex gap-2">
                <div className="text-xl">🌈</div>
                <div>
                  <h3 className="font-medium">Success Tip</h3>
                  <p className="text-sm text-gray-600">
                    Listings with 3+ photos get 50% more clicks! Add some sparkle!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            Save as Draft
          </Button>
          <Button type="submit">
            Publish Learning Adventure
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LearningCreate;
