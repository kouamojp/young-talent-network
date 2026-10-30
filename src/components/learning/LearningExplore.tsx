import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Clock, GraduationCap, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

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
}

/** Cours publiés sur YAT (table courses). */
const LearningExplore: React.FC<LearningExploreProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('courses')
      .select('id, title, description, category, level, duration_hours, price, thumbnail_url')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCourses((data as Course[] | null) ?? []);
        setLoading(false);
      });
  }, []);

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
                  <h3 className="font-semibold break-words">{course.title}</h3>
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
                {course.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2 break-words">{course.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LearningExplore;
