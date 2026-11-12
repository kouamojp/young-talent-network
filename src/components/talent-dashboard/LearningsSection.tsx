import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Clock, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { tr } from '@/i18n';

interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  price: number | null;
  duration_hours: number | null;
  students: number;
}

interface Enrollment { course_id: string; progress: number | null; completed: boolean | null; course: { title: string; category: string | null } | null }

const LearningsSection: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, description, category, level, price, duration_hours')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      const { data: enr } = await supabase
        .from('course_enrollments')
        .select('course_id, progress, completed, course:courses(title, category)')
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false });
      setEnrollments((enr as unknown as Enrollment[]) || []);

      const list = coursesData || [];
      const counts = await Promise.all(
        list.map(c =>
          supabase.from('course_enrollments').select('id', { count: 'exact', head: true }).eq('course_id', c.id)
        )
      );

      setCourses(list.map((c, i) => ({ ...c, students: counts[i].count || 0 })) as CourseRow[]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {enrollments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{tr('learningsSection.myEnrolledCourses')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {enrollments.map(e => (
              <Card key={e.course_id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/course/${e.course_id}`)}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold break-words">{e.course?.title || tr('common.courses')}</h4>
                    {e.completed && <Badge className="shrink-0">{tr('funding.completed')}</Badge>}
                  </div>
                  <Progress value={e.progress || 0} />
                  <p className="text-xs text-muted-foreground tabular-nums">{e.progress || 0} %</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{tr('learningsSection.learningContent')}</h3>
        <Button onClick={() => navigate('/learning')}>
          <Plus className="h-4 w-4 mr-2" />
          {tr('learningsSection.addContent')}
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-4">{tr('learningsSection.shareYourKnowledgeByCreatingA')}</p>
            <Button variant="outline" onClick={() => navigate('/learning')}>
              <BookOpen className="h-4 w-4 mr-2" />
              {tr('learning.createCourse')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <div className="flex gap-2 mt-1">
                      {item.category && <Badge className="bg-blue-100 text-blue-800 text-xs">{item.category}</Badge>}
                      {item.level && <Badge variant="outline" className="text-xs">{item.level}</Badge>}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {item.description && <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>}

                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{item.students} {tr('common.enrolled')}</span>
                  {item.duration_hours != null && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.duration_hours}h</span>
                  )}
                  <span className="font-semibold">{item.price != null && item.price > 0 ? `${item.price} €` : tr('common.free')}</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => navigate(`/course/${item.id}`)}>{tr('learningsSection.manageLessons')}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningsSection;
