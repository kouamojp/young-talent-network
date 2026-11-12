import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Check, Clock, GraduationCap, Loader2, Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface LearningExploreProps {
  onBack: () => void;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  duration_hours: number | null;
  price: number | null;
  thumbnail_url: string | null;
  instructor_id: string;
}

/** Cours publiés sur YAT (table courses). */
const LearningExplore: React.FC<LearningExploreProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      const [{ data }, enrollments] = await Promise.all([
        supabase
          .from('courses')
          .select('id, title, description, category, level, duration_hours, price, thumbnail_url, instructor_id')
          .order('created_at', { ascending: false }),
        user
          ? supabase.from('course_enrollments').select('course_id').eq('student_id', user.id)
          : Promise.resolve({ data: [] as { course_id: string }[] }),
      ]);
      setCourses((data as Course[] | null) ?? []);
      setEnrolledIds(new Set((enrollments.data ?? []).map(e => e.course_id)));
      setLoading(false);
    })();
  }, []);

  const enroll = async (courseId: string) => {
    if (!userId) {
      toast({ title: 'Connexion requise', description: 'Connectez-vous pour vous inscrire à un cours.', variant: 'destructive' });
      return;
    }
    setEnrollingId(courseId);
    const { error } = await supabase.from('course_enrollments').insert({ course_id: courseId, student_id: userId });
    setEnrollingId(null);
    if (error && error.code !== '23505') {
      toast({ title: "Échec de l'inscription", description: error.message, variant: 'destructive' });
      return;
    }
    setEnrolledIds(prev => new Set(prev).add(courseId));
    toast({ title: 'Inscription confirmée', description: 'Retrouvez ce cours dans votre tableau de bord.' });
  };

  const query = searchTerm.toLowerCase();
  const visible = courses.filter(c => [c.title, c.description, c.category].some(v => v?.toLowerCase().includes(query)));

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Retour">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="flex items-center gap-2 text-2xl font-semibold"><GraduationCap className="h-6 w-6 text-primary" />Cours</h1>
      </div>

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-10" placeholder="Rechercher un cours, une compétence…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            {courses.length === 0 ? 'Aucun cours publié pour le moment.' : 'Aucun cours ne correspond à cette recherche.'}
          </p>
        </div>
      ) : (
        <ul className="rounded-xl border border-border bg-card divide-y divide-border">
          {visible.map(course => (
            <li key={course.id} className="flex gap-4 p-4">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
                {course.thumbnail_url && <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/course/${course.id}`} className="font-semibold break-words hover:text-primary hover:underline">{course.title}</Link>
                  {course.price !== null && (
                    <span className="shrink-0 font-semibold tabular-nums">{Number(course.price) === 0 ? 'Gratuit' : `${Number(course.price)} $`}</span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {course.category && <Badge variant="secondary">{course.category}</Badge>}
                  {course.level && <Badge variant="outline">{course.level}</Badge>}
                  {!!course.duration_hours && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />{course.duration_hours} h</span>
                  )}
                </div>
                {course.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2 break-words whitespace-pre-line">{course.description}</p>}
                <div className="mt-3">
                  {course.instructor_id === userId ? (
                    <Badge variant="outline">Votre cours</Badge>
                  ) : enrolledIds.has(course.id) ? (
                    <Button size="sm" variant="secondary" disabled className="gap-1.5"><Check className="h-4 w-4" />Inscrit</Button>
                  ) : (
                    <Button size="sm" onClick={() => enroll(course.id)} disabled={enrollingId === course.id}>
                      {enrollingId === course.id && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                      S'inscrire
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LearningExplore;
