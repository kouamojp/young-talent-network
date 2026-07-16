import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Briefcase, DollarSign, Clock, MapPin, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Experience {
  id: string;
  title: string;
  organization: string | null;
  city: string | null;
  country: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
}

interface Request {
  id: string;
  title: string;
  budget: string | null;
  deadline: string | null;
  domain: string | null;
  request_type: string;
  status: string;
  views_count: number;
}

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '';

const WorkSection: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Experience[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const [expRes, reqRes] = await Promise.all([
        supabase.from('talent_experiences').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
        supabase.from('talent_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setJobs((expRes.data || []) as Experience[]);
      setRequests((reqRes.data || []) as Request[]);
      setLoading(false);
    })();
  }, []);

  const timeline = (job: Experience) => {
    const start = formatDate(job.start_date);
    const end = job.is_current ? 'Présent' : formatDate(job.end_date);
    return [start, end].filter(Boolean).join(' - ');
  };

  const location = (job: Experience) => [job.city, job.country].filter(Boolean).join(', ');

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">💼 Expériences</TabsTrigger>
          <TabsTrigger value="requests">📩 Demandes</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Expérience professionnelle</h3>
            <Button onClick={() => navigate('/profile')}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>

          {jobs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-4">Ajoutez votre expérience professionnelle</p>
                <Button variant="outline" onClick={() => navigate('/profile')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une expérience
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{job.title}</h4>
                          {job.is_current && (
                            <Badge variant="secondary" className="text-xs">Actuel</Badge>
                          )}
                        </div>
                        {job.organization && <p className="text-gray-600 mb-1">{job.organization}</p>}
                        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                          {timeline(job) && (
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeline(job)}</span>
                          )}
                          {location(job) && (
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location(job)}</span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>Modifier</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Mes demandes</h3>
            <Button onClick={() => navigate('/work')}>
              <Plus className="h-4 w-4 mr-2" />
              Publier
            </Button>
          </div>

          {requests.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-4">Publiez une demande pour trouver des talents</p>
                <Button variant="outline" onClick={() => navigate('/work')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une demande
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold">{request.title}</h4>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {request.views_count}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 flex-wrap">
                      {request.budget && (
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{request.budget}</span>
                      )}
                      {request.deadline && (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(request.deadline)}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">{request.request_type}</Badge>
                      {request.domain && <Badge variant="secondary" className="text-xs">{request.domain}</Badge>}
                      <Badge className="text-xs">{request.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkSection;
