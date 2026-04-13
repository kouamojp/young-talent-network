import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Shield, Users, Activity, AlertTriangle, Search, Settings, BarChart3, Eye, Trash2, Ban, CheckCircle, UserPlus, Edit, Globe, FileText, Calendar, Briefcase, Image, Radio, GraduationCap, Building2, MessageSquare, Lock, Unlock } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const AdminPanel: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('users');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('user');

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }
      
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
      if (roles && roles.length > 0) {
        const hasAdmin = roles.some(r => r.role === 'admin');
        setCurrentUserRole(hasAdmin ? 'admin' : roles[0].role);
      } else {
        setCurrentUserRole('user');
      }
      setLoading(false);
    };
    checkRole();
  }, [navigate]);

  useEffect(() => {
    if (!loading && currentUserRole) {
      fetchData();
    }
  }, [loading, currentUserRole]);

  const fetchData = async () => {
    const [usersRes, postsRes, eventsRes, communitiesRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('posts').select('*, profiles(name, avatar_url)').order('created_at', { ascending: false }).limit(50),
      supabase.from('events').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('communities').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    if (usersRes.data) setUsers(usersRes.data);
    if (postsRes.data) setPosts(postsRes.data);
    if (eventsRes.data) setEvents(eventsRes.data);
    if (communitiesRes.data) setCommunities(communitiesRes.data);
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRole) return;
    try {
      const { error } = await supabase.from('user_roles').upsert(
        { user_id: selectedUserId, role: selectedRole as any },
        { onConflict: 'user_id,role' }
      );
      if (error) throw error;
      toast({ title: t('admin.roleAssigned') });
      setRoleDialogOpen(false);
    } catch (err) {
      toast({ title: t('admin.roleError'), variant: 'destructive' });
    }
  };

  const handleDeletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({ title: t('admin.postDeleted') });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (!error) {
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast({ title: t('admin.eventDeleted') });
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: t('admin.totalUsers'), value: users.length.toString(), icon: Users, color: 'text-blue-600' },
    { label: t('admin.totalPosts'), value: posts.length.toString(), icon: FileText, color: 'text-green-600' },
    { label: t('admin.totalEvents'), value: events.length.toString(), icon: Calendar, color: 'text-purple-600' },
    { label: t('admin.totalCommunities'), value: communities.length.toString(), icon: Building2, color: 'text-amber-600' },
  ];

  const getRoleBadge = (userType: string) => {
    switch (userType) {
      case 'agent': return <Badge className="bg-blue-100 text-blue-800">{t('admin.agent')}</Badge>;
      case 'organization': return <Badge className="bg-teal-100 text-teal-800">{t('admin.organization')}</Badge>;
      default: return <Badge variant="secondary">{t('admin.talent')}</Badge>;
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t('admin.panel')}</h1>
            <p className="text-sm text-muted-foreground">
              {currentUserRole === 'admin' ? t('admin.superAdmin') : t('admin.moderator')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><UserPlus className="h-4 w-4 mr-2" />{t('admin.assignRole')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t('admin.assignRole')}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <Select value={selectedUserId || ''} onValueChange={setSelectedUserId}>
                  <SelectTrigger><SelectValue placeholder={t('admin.selectUser')} /></SelectTrigger>
                  <SelectContent>
                    {users.slice(0, 20).map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t('admin.admin')}</SelectItem>
                    <SelectItem value="moderator">{t('admin.moderator')}</SelectItem>
                    <SelectItem value="user">{t('admin.user')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAssignRole} className="w-full">{t('admin.confirm')}</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline"><Settings className="h-4 w-4 mr-2" />{t('admin.systemSettings')}</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="users">{t('admin.userManagement')}</TabsTrigger>
          <TabsTrigger value="content">{t('admin.contentManagement')}</TabsTrigger>
          <TabsTrigger value="events">{t('admin.eventsManagement')}</TabsTrigger>
          <TabsTrigger value="roles">{t('admin.manageRoles')}</TabsTrigger>
          <TabsTrigger value="moderation">{t('admin.contentModeration')}</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('admin.searchUsers')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.name')}</TableHead>
                    <TableHead>{t('admin.email')}</TableHead>
                    <TableHead>{t('admin.type')}</TableHead>
                    <TableHead>{t('admin.country')}</TableHead>
                    <TableHead>{t('admin.joined')}</TableHead>
                    <TableHead>{t('admin.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="text-xs">{user.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.user_type)}</TableCell>
                      <TableCell>{user.country || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/talent/${user.id}`)}><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedUserId(user.id); setRoleDialogOpen(true); }}><Lock className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t('admin.allPosts')}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{post.profiles?.name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{post.content}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">{t('admin.review')}</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeletePost(post.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && <p className="text-muted-foreground text-center py-4">{t('admin.noContent')}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t('admin.allEvents')}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.location || '—'} • {new Date(event.start_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">{t('common.edit')}</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && <p className="text-muted-foreground text-center py-4">{t('admin.noContent')}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-red-500" />{t('admin.superAdmin')}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{t('admin.superAdminDesc')}</p>
                <Badge className="bg-red-100 text-red-800">{t('admin.fullAccess')}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lock className="h-5 w-5 text-blue-500" />{t('admin.moderator')}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{t('admin.moderatorDesc')}</p>
                <Badge className="bg-blue-100 text-blue-800">{t('admin.limitedAccess')}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-gray-500" />{t('admin.user')}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{t('admin.userDesc')}</p>
                <Badge variant="secondary">{t('admin.standardAccess')}</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t('admin.contentModeration')}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.slice(0, 5).map((post, i) => (
                  <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{t('admin.reportedPost')} #{i + 1}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-md">{post.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline"><CheckCircle className="h-4 w-4 mr-1" />{t('admin.approve')}</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeletePost(post.id)}><Trash2 className="h-4 w-4 mr-1" />{t('admin.remove')}</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
