import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Clock, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

const LearningsSection: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, description, category, level, price, duration_hours')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contenus pédagogiques</h3>
        <Button onClick={() => navigate('/learning')}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un contenu
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-4">Partagez votre savoir en créant un cours</p>
            <Button variant="outline" onClick={() => navigate('/learning')}>
              <BookOpen className="h-4 w-4 mr-2" />
              Créer un cours
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
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{item.students} inscrits</span>
                  {item.duration_hours != null && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.duration_hours}h</span>
                  )}
                  <span className="font-semibold">{item.price != null && item.price > 0 ? `${item.price} €` : 'Gratuit'}</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate('/learning')}>Modifier</Button>
                  <Button size="sm" className="flex-1" onClick={() => navigate('/learning')}>Voir</Button>
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
