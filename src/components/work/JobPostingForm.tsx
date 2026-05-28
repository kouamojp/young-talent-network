
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { useForm } from 'react-hook-form';
import { Briefcase, Calendar, MapPin, Clock, Trophy, Target } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SPORT_SCHEMAS } from '@/components/profile/sport-profile-schema';
import { useLanguage } from '@/i18n/LanguageContext';


const jobFormSchema = z.object({
  title: z.string().min(3, { message: "Job title must be at least 3 characters." }),
  company: z.string().min(2, { message: "Company name is required" }),
  location: z.string().min(2, { message: "Location is required" }),
  type: z.string().min(2, { message: "Job type is required" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  requirements: z.string().min(10, { message: "Requirements must be at least 10 characters." }),
  salary: z.string().optional(),
  applicationDeadline: z.string().optional(),
  tags: z.string().optional(),
  // Sport-specific recruitment criteria (optional)
  sport: z.string().optional(),
  sportRole: z.string().optional(),
  minRank: z.string().optional(),
  leagueLevel: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;


interface JobPostingFormProps {
  onSubmit: (data: JobFormValues) => void;
  initialData?: Partial<JobFormValues>;
  isLoading?: boolean;
}

const JobPostingForm: React.FC<JobPostingFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false
}) => {
  const { language } = useLanguage();
  const lang = (language as 'en' | 'fr' | 'ru') || 'en';

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      company: initialData?.company || '',
      location: initialData?.location || '',
      type: initialData?.type || '',
      description: initialData?.description || '',
      requirements: initialData?.requirements || '',
      salary: initialData?.salary || '',
      applicationDeadline: initialData?.applicationDeadline || '',
      tags: initialData?.tags || '',
      sport: (initialData as any)?.sport || '',
      sportRole: (initialData as any)?.sportRole || '',
      minRank: (initialData as any)?.minRank || '',
      leagueLevel: (initialData as any)?.leagueLevel || '',
    },
  });

  const selectedSport = form.watch('sport');
  const sportSchema = useMemo(
    () => SPORT_SCHEMAS.find((s) => s.id === selectedSport),
    [selectedSport],
  );
  const roleField = useMemo(
    () => sportSchema?.fields.find((f) => f.key === 'role' || f.key === 'position'),
    [sportSchema],
  );
  const rankField = useMemo(
    () => sportSchema?.fields.find((f) => f.key === 'rank'),
    [sportSchema],
  );
  const leaguesField = useMemo(
    () => sportSchema?.fields.find((f) => f.key === 'leagues'),
    [sportSchema],
  );

  const handleSubmit = (data: JobFormValues) => {
    onSubmit(data);
  };



  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          {initialData ? "Edit Job Posting" : "Create New Job Posting"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Basketball Coach" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company/Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Elite Sports Academy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input className="pl-8" placeholder="e.g. New York, NY" {...field} />
                      </div>
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
                    <FormLabel>Job Type</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input className="pl-8" placeholder="e.g. Full-time, Part-time" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the job responsibilities and expectations..."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List required skills, experience, and qualifications..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary/Compensation (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. $50,000 - $60,000 per year" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="applicationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                          className="pl-8" 
                          placeholder="e.g. 2023-12-31" 
                          type="date"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. basketball, coaching, sports (comma separated)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter comma-separated tags to help with search visibility
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : initialData ? "Update Job" : "Post Job"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default JobPostingForm;
