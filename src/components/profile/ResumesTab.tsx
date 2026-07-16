
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GlassMorphism from '@/components/GlassMorphism';
import { Plus, FileText, Briefcase, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import ResumeCard, { ResumeProps } from './ResumeCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface JobApplication {
  id: string;
  position: string;
  organization: string;
  status: string;
  appliedDate: string;
  deadline: string;
}

interface ResumeRow {
  id: string;
  title: string;
  experience: string | null;
  achievements: string[] | null;
  is_primary: boolean | null;
  is_public: boolean | null;
  updated_at: string | null;
  categories?: { name?: string | null; name_fr?: string | null } | null;
}

interface ApplicationRow {
  id: string;
  status: string | null;
  created_at: string | null;
  job_postings?: {
    title?: string | null;
    location?: string | null;
    application_deadline?: string | null;
    organization?: { name?: string | null } | null;
  } | null;
}

const statusBadgeClass = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'applied' || s === 'pending') return 'bg-blue-100 text-blue-800';
  if (s === 'interview' || s === 'accepted') return 'bg-green-100 text-green-800';
  if (s === 'rejected') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
};

const ResumesTab: React.FC = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeProps[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumes' | 'applications'>('resumes');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [resumesRes, skillsRes, applicationsRes] = await Promise.all([
        supabase
          .from('talent_resumes')
          .select('*, categories(name, name_fr)')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false }),
        supabase
          .from('user_skills')
          .select('skills(name)')
          .eq('user_id', user.id),
        supabase
          .from('job_applications')
          .select('id, status, created_at, job_postings(title, location, application_deadline, organization:profiles!job_postings_organization_id_fkey(name))')
          .eq('applicant_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      const skillNames = (skillsRes.data || [])
        .map((s: { skills?: { name?: string } | null }) => s.skills?.name)
        .filter(Boolean) as string[];

      const mappedResumes: ResumeProps[] = ((resumesRes.data || []) as unknown as ResumeRow[]).map((r) => ({
        id: r.id,
        title: r.title,
        category: r.categories?.name_fr || r.categories?.name || 'Général',
        skills: skillNames,
        experience: r.experience || '',
        achievements: r.achievements || [],
        isActive: !!(r.is_primary || r.is_public),
        lastUpdated: r.updated_at ? new Date(r.updated_at).toLocaleDateString('fr-FR') : '',
      }));

      const mappedApplications: JobApplication[] = ((applicationsRes.data || []) as unknown as ApplicationRow[]).map((a) => ({
        id: a.id,
        position: a.job_postings?.title || 'Poste',
        organization: a.job_postings?.organization?.name || a.job_postings?.location || '—',
        status: a.status || 'Applied',
        appliedDate: a.created_at ? new Date(a.created_at).toLocaleDateString('fr-FR') : '',
        deadline: a.job_postings?.application_deadline
          ? new Date(a.job_postings.application_deadline).toLocaleDateString('fr-FR')
          : '—',
      }));

      setResumes(mappedResumes);
      setApplications(mappedApplications);
      setLoading(false);
    };
    load();
  }, []);

  const handleNewResume = () => navigate('/profile');

  const handleEditResume = (id: string) => navigate('/profile');

  const handleViewResume = (id: string) => {
    const resume = resumes.find(r => r.id === id);
    if (resume) navigate('/profile');
  };

  const handleDeleteResume = async (id: string) => {
    const { error } = await supabase.from('talent_resumes').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    setResumes(prev => prev.filter(resume => resume.id !== id));
    toast({ title: 'CV supprimé' });
  };

  return (
    <TooltipProvider>
      <GlassMorphism className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">My Career Profile</h3>
          <Button onClick={handleNewResume} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Resume
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'resumes' | 'applications')}>
            <TabsList className="mb-6">
              <TabsTrigger value="resumes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                My Resumes
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Job Applications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resumes">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumes.map(resume => (
                  <ResumeCard
                    key={resume.id}
                    resume={resume}
                    onEdit={handleEditResume}
                    onDelete={handleDeleteResume}
                    onView={handleViewResume}
                  />
                ))}

                {resumes.length === 0 && (
                  <Card className="col-span-full py-8 px-4">
                    <CardContent className="flex flex-col items-center text-center">
                      <FileText className="h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="text-xl font-bold mb-2">No Resumes Yet</h3>
                      <p className="text-gray-600 mb-4">
                        Create your first resume to showcase your talents and skills!
                      </p>
                      <Button onClick={handleNewResume}>
                        Create Resume
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="applications">
              <div className="rounded-lg overflow-hidden border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((application) => (
                      <tr key={application.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{application.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.organization}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClass(application.status)}`}>
                            {application.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.appliedDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.deadline}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm" onClick={() => navigate('/work')}>View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {applications.length === 0 && (
                  <div className="py-8 px-4 text-center bg-white">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium mb-2">No Job Applications</h3>
                    <p className="text-gray-500 mb-4">You haven't applied to any jobs yet</p>
                    <Button onClick={() => navigate('/work')}>Browse Job Openings</Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </GlassMorphism>
    </TooltipProvider>
  );
};

export default ResumesTab;
