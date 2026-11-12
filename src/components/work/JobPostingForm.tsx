
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
  title: z.string().min(3, { message: "Le titre doit faire au moins 3 caractères." }),
  company: z.string().min(2, { message: "Le nom de l'organisation est obligatoire." }),
  location: z.string().min(2, { message: "Le lieu est obligatoire." }),
  type: z.string().min(2, { message: "Le type de contrat est obligatoire." }),
  description: z.string().min(20, { message: "La description doit faire au moins 20 caractères." }),
  requirements: z.string().min(10, { message: "Les prérequis doivent faire au moins 10 caractères." }),
  salary: z.string().optional(),
  applicationDeadline: z.string().optional(),
  tags: z.string().optional(),
  // Sport-specific recruitment criteria (optional)
  sport: z.string().optional(),
  sportRole: z.string().optional(),
  minRank: z.string().optional(),
  leagueLevel: z.string().optional(),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;


interface JobPostingFormProps {
  onSubmit: (data: JobFormValues) => void;
  initialData?: Partial<JobFormValues>;
  isLoading?: boolean;
  onCancel?: () => void;
}

const JobPostingForm: React.FC<JobPostingFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  onCancel,
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
          {initialData?.title ? "Modifier l'offre" : "Nouvelle offre"}
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
                    <FormLabel>Intitulé du poste</FormLabel>
                    <FormControl>
                      <Input placeholder="ex. Entraîneur de basket U15" {...field} />
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
                    <FormLabel>Organisation</FormLabel>
                    <FormControl>
                      <Input placeholder="ex. Académie Elite Sports" {...field} />
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
                    <FormLabel>Lieu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-8" placeholder="ex. Lyon, France" {...field} />
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
                    <FormLabel>Type de contrat</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-8" placeholder="ex. CDI, temps partiel, stage" {...field} />
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
                  <FormLabel>Description du poste</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Missions, contexte, ce que vous attendez…"
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
                  <FormLabel>Prérequis (un par ligne)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Compétences, expérience, diplômes…"
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
                    <FormLabel>Rémunération (facultatif)</FormLabel>
                    <FormControl>
                      <Input placeholder="ex. 1 800 € brut / mois" {...field} />
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
                    <FormLabel>Date limite de candidature (facultatif)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          className="pl-8" 
                          
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
                  <FormLabel>Mots-clés (facultatif)</FormLabel>
                  <FormControl>
                    <Input placeholder="ex. basket, coaching, jeunes (séparés par des virgules)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Ils aident les talents à trouver votre offre.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Sport-specific recruitment criteria */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Trophy className="h-4 w-4" />
                Critères sportifs
                <Badge variant="outline" className="ml-auto text-[10px]">Facultatif</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Ciblez les athlètes au profil correspondant (utilisé par la suggestion de candidats).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sport</FormLabel>
                      <Select
                        value={field.value || ''}
                        onValueChange={(v) => {
                          field.onChange(v === '__none__' ? '' : v);
                          form.setValue('sportRole', '');
                          form.setValue('minRank', '');
                          form.setValue('leagueLevel', '');
                        }}
                      >
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Tous sports" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">Tous sports</SelectItem>
                          {SPORT_SCHEMAS.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.label[lang]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {roleField && (
                  <FormField
                    control={form.control}
                    name="sportRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {roleField.label[lang]}
                        </FormLabel>
                        <Select
                          value={field.value || ''}
                          onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                        >
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Tous postes" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__none__">Tous postes</SelectItem>
                            {roleField.options?.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label[lang]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {rankField && (
                  <FormField
                    control={form.control}
                    name="minRank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau minimum</FormLabel>
                        <Select
                          value={field.value || ''}
                          onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                        >
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Tous niveaux" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__none__">Tous niveaux</SelectItem>
                            {rankField.options?.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label[lang]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {leaguesField && (
                  <FormField
                    control={form.control}
                    name="leagueLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau de ligue</FormLabel>
                        <Select
                          value={field.value || ''}
                          onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                        >
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Toutes ligues" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__none__">Toutes ligues</SelectItem>
                            {leaguesField.options?.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label[lang]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">

              <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Publication…" : "Publier l'offre"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default JobPostingForm;
