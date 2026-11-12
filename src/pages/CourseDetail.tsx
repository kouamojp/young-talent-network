import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, Circle, Clock, GraduationCap, Loader2, Plus, PlayCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { tr } from '@/i18n';

interface Course {
  id: string; title: string; description: string | null; category: string | null; level: string | null;
  duration_hours: number | null; price: number | null; thumbnail_url: string | null; instructor_id: string;
  instructor?: { name: string | null; avatar_url: string | null } | null;
}
interface Lesson { id: string; position: number; title: string; content: string | null; video_url: string | null }

/** Détail d'un cours : leçons, inscription, progression (élève) et gestion des leçons (formateur). */
const CourseDetail: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({ title: '', content: '', video_url: '' });

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    const [{ data: c }, { data: ls }] = await Promise.all([
      supabase.from('courses')
        .select('id, title, description, category, level, duration_hours, price, thumbnail_url, instructor_id, instructor:profiles!courses_instructor_id_fkey(name, avatar_url)')
        .eq('id', id).maybeSingle(),
      (supabase.from as any)('course_lessons').select('id, position, title, content, video_url').eq('course_id', id).order('position'),
    ]);
    setCourse((c as unknown as Course) ?? null);
    const lessonRows = (ls || []) as Lesson[];
    setLessons(lessonRows);
    if (user) {
      const [{ data: enr }, { data: prog }] = await Promise.all([
        supabase.from('course_enrollments').select('id').eq('course_id', id).eq('student_id', user.id).maybeSingle(),
        lessonRows.length
          ? (supabase.from as any)('course_lesson_progress').select('lesson_id').eq('user_id', user.id).in('lesson_id', lessonRows.map(l => l.id))
          : Promise.resolve({ data: [] }),
      ]);
      setEnrolled(!!enr);
      setDoneIds(new Set(((prog || []) as { lesson_id: string }[]).map(p => p.lesson_id)));
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const isInstructor = !!course && course.instructor_id === userId;
  const doneCount = lessons.filter(l => doneIds.has(l.id)).length;
  const pct = lessons.length ? Math.round((doneCount * 100) / lessons.length) : 0;

  const enroll = async () => {
    if (!userId) { navigate('/auth'); return; }
    setBusy('enroll');
    const { error } = await supabase.from('course_enrollments').insert({ course_id: id, student_id: userId });
    setBusy(null);
    if (error && error.code !== '23505') { toast({ title: tr('courseDetail.couldNotEnroll'), description: error.message, variant: 'destructive' }); return; }
    setEnrolled(true);
    toast({ title: tr('common.enrollmentConfirmed') });
  };

  const toggleLesson = async (lesson: Lesson) => {
    if (!userId || !enrolled) return;
    const done = doneIds.has(lesson.id);
    setBusy(lesson.id);
    const { error } = done
      ? await (supabase.from as any)('course_lesson_progress').delete().eq('user_id', userId).eq('lesson_id', lesson.id)
      : await (supabase.from as any)('course_lesson_progress').insert({ user_id: userId, lesson_id: lesson.id });
    setBusy(null);
    if (error) { toast({ title: tr('common.couldNotUpdate'), description: error.message, variant: 'destructive' }); return; }
    const next = new Set(doneIds);
    if (done) next.delete(lesson.id); else next.add(lesson.id);
    setDoneIds(next);
    if (!done && next.size === lessons.length) {
      toast({ title: tr('courseDetail.courseCompleted'), description: tr('courseDetail.wellDoneYouEarn50Xp') });
    }
  };

  const addLesson = async () => {
    if (!newLesson.title.trim()) return;
    setBusy('add');
    const { error } = await (supabase.from as any)('course_lessons').insert({
      course_id: id,
      position: lessons.length ? Math.max(...lessons.map(l => l.position)) + 1 : 1,
      title: newLesson.title.trim(),
      content: newLesson.content.trim() || null,
      video_url: newLesson.video_url.trim() || null,
    });
    setBusy(null);
    if (error) { toast({ title: tr('courseDetail.couldNotAdd'), description: error.message, variant: 'destructive' }); return; }
    setNewLesson({ title: '', content: '', video_url: '' });
    load();
  };

  const deleteLesson = async (lesson: Lesson) => {
    setBusy(lesson.id);
    const { error } = await (supabase.from as any)('course_lessons').delete().eq('id', lesson.id);
    setBusy(null);
    if (error) { toast({ title: tr('common.couldNotDelete'), description: error.message, variant: 'destructive' }); return; }
    setLessons(prev => prev.filter(l => l.id !== lesson.id));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-muted-foreground">{tr('courseDetail.thisCourseDoesNotExistOr')}</p>
        <Button variant="outline" onClick={() => navigate('/learning')}>{tr('courseDetail.backToCourses')}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="h-4 w-4" />{tr('common.back')}</Button>

      <header className="bg-card border border-border rounded-xl overflow-hidden">
        {course.thumbnail_url && <img src={course.thumbnail_url} alt="" className="w-full h-48 object-cover" />}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-primary"><GraduationCap className="h-5 w-5" /><span className="text-sm font-medium">{tr('common.courses')}</span></div>
          <h1 className="text-2xl font-bold break-words">{course.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {course.category && <Badge variant="secondary">{course.category}</Badge>}
            {course.level && <Badge variant="outline">{course.level}</Badge>}
            {!!course.duration_hours && <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />{course.duration_hours} h</span>}
            <span className="font-semibold">{!course.price || Number(course.price) === 0 ? tr('common.free') : `${Number(course.price)} €`}</span>
          </div>
          {course.instructor?.name && (
            <p className="text-sm text-muted-foreground">
              {tr('courseDetail.by')} <Link to={`/talent/${course.instructor_id}`} className="text-foreground hover:underline">{course.instructor.name}</Link>
            </p>
          )}
          {course.description && <p className="text-[15px] whitespace-pre-line break-words">{course.description}</p>}

          {!isInstructor && (enrolled ? (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-sm"><span>{tr('funding.progress')}</span><span className="tabular-nums">{doneCount}/{lessons.length} {tr('courseDetail.lessons')} {pct} %</span></div>
              <Progress value={pct} />
            </div>
          ) : (
            <Button onClick={enroll} disabled={busy === 'enroll'} className="mt-2">
              {busy === 'enroll' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{tr('courseDetail.enrollInTheCourse')}
            </Button>
          ))}
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{tr('courseDetail.lessons2')}{lessons.length})</h2>
        {lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isInstructor ? tr('courseDetail.addTheFirstLessonBelow') : tr('courseDetail.theInstructorHasNotPublishedAny')}
          </p>
        ) : (
          <ol className="bg-card border border-border rounded-xl divide-y divide-border">
            {lessons.map((l, i) => {
              const done = doneIds.has(l.id);
              const isOpen = openLesson === l.id;
              return (
                <li key={l.id} className="p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    {enrolled && !isInstructor ? (
                      <button type="button" onClick={() => toggleLesson(l)} disabled={busy === l.id}
                        aria-label={done ? tr('courseDetail.markAsNotCompleted') : tr('courseDetail.markAsCompleted')} className="shrink-0">
                        {busy === l.id ? <Loader2 className="h-5 w-5 animate-spin" />
                          : done ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                      </button>
                    ) : (
                      <span className="shrink-0 w-5 text-center text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                    )}
                    <button type="button" onClick={() => setOpenLesson(isOpen ? null : l.id)} className="flex-1 text-left font-medium break-words hover:text-primary">
                      {l.title}
                    </button>
                    {l.video_url && <PlayCircle className="h-4 w-4 text-muted-foreground shrink-0" />}
                    {isInstructor && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteLesson(l)} disabled={busy === l.id} aria-label={tr('courseDetail.deleteLesson')}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {isOpen && (
                    <div className="pl-8 space-y-2 text-sm">
                      {l.content && <p className="whitespace-pre-line break-words">{l.content}</p>}
                      {l.video_url && (
                        <a href={l.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline break-all">
                          <PlayCircle className="h-4 w-4" />{tr('courseDetail.watchTheVideo')}
                        </a>
                      )}
                      {enrolled && !isInstructor && !done && (
                        <div><Button size="sm" variant="outline" onClick={() => toggleLesson(l)} className="gap-1.5"><Check className="h-4 w-4" />{tr('courseDetail.iHaveCompletedThisLesson')}</Button></div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {isInstructor && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><Plus className="h-4 w-4" />{tr('courseDetail.addALesson')}</h3>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-title">{tr('events.eventName')}</Label>
              <Input id="lesson-title" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} placeholder={tr('courseDetail.eGDribblingBasics')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-content">{tr('courseDetail.content')}</Label>
              <Textarea id="lesson-content" rows={4} value={newLesson.content} onChange={e => setNewLesson({ ...newLesson, content: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-video">{tr('courseDetail.videoLinkYoutubeVimeo')}</Label>
              <Input id="lesson-video" type="url" value={newLesson.video_url} onChange={e => setNewLesson({ ...newLesson, video_url: e.target.value })} placeholder="https://" />
            </div>
            <Button onClick={addLesson} disabled={!newLesson.title.trim() || busy === 'add'}>
              {busy === 'add' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{tr('courseDetail.addLesson')}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default CourseDetail;
