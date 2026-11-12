import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Upload, Calendar, Clock, Globe, MapPin, DollarSign, Users, Loader2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { categories } from './data/categories';
import { tr } from '@/i18n';
import { localeTag } from '@/i18n/format';

interface LearningCreateProps {
  onBack: () => void;
}

interface LearningFormValues {
  title: string;
  learningType: string;
  instructor: string;
  description: string;
  category: string;
  subcategory: string;
  locationType: string;
  address: string;
  startDate: string;
  durationHours: string;
  price: string;
  maxParticipants: string;
  skillLevel: string;
  requirements: string;
}

const locationTypes = [
  { value: 'remote', label: tr('learningCreate.remote') },
  { value: 'in-person', label: tr('learningCreate.inPerson') },
  { value: 'hybrid', label: tr('learningCreate.hybrid') },
];

const learningTypes = [
  { value: 'training', label: tr('profile.training') },
  { value: 'seminar', label: tr('learningCreate.seminar') },
  { value: 'masterclass', label: tr('learningCreate.masterclass') },
  { value: 'lecture', label: tr('learningCreate.lecture') },
];

const skillLevels = [
  { value: 'beginner', label: tr('common.beginner') },
  { value: 'intermediate', label: tr('common.intermediate') },
  { value: 'advanced', label: tr('common.advanced') },
  { value: 'all-levels', label: tr('common.allLevels') },
];

const labelOf = (list: { value: string; label: string }[], value: string) =>
  list.find(i => i.value === value)?.label || value;

/**
 * Formulaire de création de cours. Les champs sans colonne dédiée dans la
 * table `courses` (type, lieu, date, places, prérequis…) sont ajoutés en fin
 * de description pour ne pas être perdus.
 */
const LearningCreate: React.FC<LearningCreateProps> = ({ onBack }) => {
  const form = useForm<LearningFormValues>({
    defaultValues: {
      title: '', learningType: '', instructor: '', description: '', category: '', subcategory: '',
      locationType: '', address: '', startDate: '', durationHours: '', price: '', maxParticipants: '',
      skillLevel: '', requirements: '',
    },
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const buildDescription = (v: LearningFormValues) => {
    const details = [
      v.learningType && `Type : ${labelOf(learningTypes, v.learningType)}`,
      v.instructor && `Intervenant : ${v.instructor}`,
      v.subcategory && `Spécialité : ${v.subcategory}`,
      v.locationType && `Format : ${labelOf(locationTypes, v.locationType)}`,
      v.address && `Lieu : ${v.address}`,
      v.startDate && `Début : ${new Date(v.startDate).toLocaleDateString(localeTag())}`,
      v.maxParticipants && `Places : ${v.maxParticipants}`,
      v.requirements && `Prérequis : ${v.requirements}`,
    ].filter(Boolean);
    return [v.description.trim(), details.join('\n')].filter(Boolean).join('\n\n');
  };

  const handleSubmit = async (values: LearningFormValues) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: tr('messages.loginRequired'), description: tr('learningCreate.logInToPublishACourse'), variant: 'destructive' });
        return;
      }

      let thumbnailUrl: string | null = null;
      if (thumbnail) {
        const ext = thumbnail.name.split('.').pop();
        const path = `${user.id}/courses/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('profile-files').upload(path, thumbnail);
        if (uploadError) throw uploadError;
        thumbnailUrl = supabase.storage.from('profile-files').getPublicUrl(path).data.publicUrl;
      }

      const duration = parseFloat(values.durationHours.replace(',', '.'));
      const price = parseFloat(values.price.replace(',', '.'));

      const { data: created, error } = await supabase.from('courses').insert({
        instructor_id: user.id,
        title: values.title.trim(),
        description: buildDescription(values) || null,
        category: values.category || null,
        level: values.skillLevel ? labelOf(skillLevels, values.skillLevel) : null,
        duration_hours: Number.isFinite(duration) ? Math.round(duration) : null,
        price: Number.isFinite(price) ? price : 0,
        thumbnail_url: thumbnailUrl,
      }).select('id').single();
      if (error) throw error;

      toast({ title: tr('learningCreate.coursePublished'), description: tr('learningCreate.nowAddYourLessons') });
      form.reset();
      setThumbnail(null);
      navigate(`/course/${created.id}`);
    } catch (error: any) {
      toast({ title: tr('learningCreate.publishingFailed'), description: error?.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const titleError = form.formState.errors.title;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label={tr('common.back')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <GraduationCap className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{tr('learning.createCourse')}</h1>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <section className="bg-card border border-border p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold">{tr('learningCreate.1MainInformation')}</h2>

          <div className="space-y-1.5">
            <Label htmlFor="title">{tr('events.eventName')}</Label>
            <Input id="title" placeholder={tr('learningCreate.eGPublicSpeaking3Days')}
              {...form.register('title', { required: tr('marketplace.titleIsRequired'), validate: v => v.trim().length > 0 || tr('marketplace.titleIsRequired') })} />
            {titleError && <p className="text-xs text-destructive">{titleError.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="learning-type">{tr('marketplace.type')}</Label>
              <Select value={form.watch('learningType')} onValueChange={(v) => form.setValue('learningType', v)}>
                <SelectTrigger id="learning-type"><SelectValue placeholder={tr('learningCreate.chooseAType')} /></SelectTrigger>
                <SelectContent>
                  {learningTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="instructor">{tr('learningCreate.instructor')}</Label>
              <Input id="instructor" placeholder={tr('learningCreate.eGDrJaneMartin')} {...form.register('instructor')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">{tr('events.description')}</Label>
            <Textarea id="description" className="min-h-32" placeholder={tr('learningCreate.whatParticipantsWillLearn')} {...form.register('description')} />
          </div>
        </section>

        <section className="bg-card border border-border p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold">{tr('learningCreate.2CategoryAndLocation')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">{tr('categories.selectCategory')}</Label>
              <Select value={form.watch('category')} onValueChange={(v) => form.setValue('category', v)}>
                <SelectTrigger id="category"><SelectValue placeholder={tr('learningCreate.chooseACategory')} /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.name}>
                      <span className="mr-2">{c.icon}</span>{c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subcategory">{tr('common.specialty')}</Label>
              <Input id="subcategory" placeholder={tr('learningCreate.eGGuitarCodingPublicSpeaking')} {...form.register('subcategory')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location-type">{tr('post.aspect')}</Label>
              <Select value={form.watch('locationType')} onValueChange={(v) => form.setValue('locationType', v)}>
                <SelectTrigger id="location-type"><SelectValue placeholder={tr('learningCreate.chooseAFormat')} /></SelectTrigger>
                <SelectContent>
                  {locationTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="inline-flex items-center">
                        {t.value === 'remote' ? <Globe className="mr-2 h-4 w-4" /> : <MapPin className="mr-2 h-4 w-4" />}
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">{tr('learningCreate.address')}</Label>
              <Input id="address" placeholder={tr('learningCreate.forInPersonOrHybrid')} {...form.register('address')} />
            </div>
          </div>
        </section>

        <section className="bg-card border border-border p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold">{tr('learningCreate.3Organization')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="start-date">{tr('common.startDate')}</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="start-date" type="date" className="pl-10" {...form.register('startDate')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration">{tr('learningCreate.durationHours')}</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="duration" type="number" min="0" step="1" placeholder={tr('learningCreate.eG6')} className="pl-10" {...form.register('durationHours')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">{tr('learningCreate.price0Free')}</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="price" type="number" min="0" step="0.01" placeholder="0" className="pl-10" {...form.register('price')} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="max-participants">{tr('learningCreate.numberOfSeats')}</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="max-participants" type="number" min="1" placeholder={tr('learningCreate.eG20')} className="pl-10" {...form.register('maxParticipants')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skill-level">{tr('common.level')}</Label>
              <Select value={form.watch('skillLevel')} onValueChange={(v) => form.setValue('skillLevel', v)}>
                <SelectTrigger id="skill-level"><SelectValue placeholder={tr('learningCreate.chooseALevel')} /></SelectTrigger>
                <SelectContent>
                  {skillLevels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="thumbnail">{tr('learningCreate.coverImage')}</Label>
            <input id="thumbnail" ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)} />
            {thumbnail ? (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <img src={URL.createObjectURL(thumbnail)} alt="" className="h-14 w-20 rounded object-cover" />
                <span className="flex-1 truncate text-sm">{thumbnail.name}</span>
                <Button type="button" variant="ghost" size="icon" aria-label={tr('learningCreate.removeImage')}
                  onClick={() => { setThumbnail(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">{tr('learningCreate.clickToChooseAnImage')}</span>
              </button>
            )}
          </div>
        </section>

        <section className="bg-card border border-border p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold">{tr('learningCreate.4Requirements')}</h2>
          <div className="space-y-1.5">
            <Label htmlFor="requirements">{tr('learningCreate.requiredEquipmentOrKnowledge')}</Label>
            <Textarea id="requirements" placeholder={tr('learningCreate.eGBringANotebookAnd')} {...form.register('requirements')} />
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>{tr('common.cancel')}</Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {tr('learningCreate.publishCourse')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LearningCreate;
