import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Shield, Users, Search, FileText, Calendar, Building2, Trash2, CheckCircle, UserPlus, Eye, Lock, TrendingUp, Activity, BarChart3, Pencil, Megaphone, Plus, EyeOff, FileEdit, Upload, Loader2, ShoppingBag, MousePointerClick } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
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
  const [selectedTab, setSelectedTab] = useState('overview');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const [weeklyGrowth, setWeeklyGrowth] = useState(0);
  const [activeToday, setActiveToday] = useState(0);
  const [retentionRate, setRetentionRate] = useState(0);
  const [editUser, setEditUser] = useState<any>(null);
  const [editPost, setEditPost] = useState<any>(null);
  const [editEvent, setEditEvent] = useState<any>(null);
  const [editCommunity, setEditCommunity] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [editAd, setEditAd] = useState<any>(null);
  const [adUploading, setAdUploading] = useState(false);
  const [marketplaceListings, setMarketplaceListings] = useState<any[]>([]);

  const AD_SIZE_HINTS: Record<string, string> = {
    feed: 'Рекоменд. 1200×400 (3:1), до 2 МБ',
    sidebar: 'Рекоменд. 400×400 (1:1), до 1 МБ',
    banner: 'Рекоменд. 1600×300 (≈16:3), до 2 МБ',
  };

  const handleAdImageUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'Файл больше 5 МБ', variant: 'destructive' }); return; }
    setAdUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `ads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('ad-files').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('ad-files').getPublicUrl(path);
      setEditAd((prev: any) => ({ ...(prev || {}), image_url: data.publicUrl }));
      toast({ title: 'Изображение загружено' });
    } catch (e: any) {
      toast({ title: e.message || 'Ошибка загрузки', variant: 'destructive' });
    } finally { setAdUploading(false); }
  };

  const setListingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('marketplace_listings').update({ status }).eq('id', id);
    if (error) return toast({ title: error.message, variant: 'destructive' });
    setMarketplaceListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    toast({ title: `Объявление → ${status}` });
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Удалить объявление?')) return;
    const { error } = await supabase.from('marketplace_listings').delete().eq('id', id);
    if (error) return toast({ title: error.message, variant: 'destructive' });
    setMarketplaceListings(prev => prev.filter(l => l.id !== id));
  };

  const saveUser = async () => {
    if (!editUser) return;
    const { error } = await supabase.from('profiles').update({
      name: editUser.name, bio: editUser.bio, city: editUser.city,
      country: editUser.country, user_type: editUser.user_type,
    }).eq('id', editUser.id);
    if (error) return toast({ title: error.message, variant: 'destructive' });
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...editUser } : u));
    setEditUser(null); toast({ title: 'User updated' });
  };

  const savePost = async () => {
    if (!editPost) return;
    const { error } = await supabase.from('posts').update({
      content: editPost.content, visibility: editPost.visibility,
      is_published: editPost.is_published, status: editPost.status,
    }).eq('id', editPost.id);
    if (error) return toast({ title: error.message, variant: 'destructive' });
    setPosts(prev => prev.map(p => p.id === editPost.id ? { ...p, ...editPost } : p));
    setEditPost(null); toast({ title: 'Post updated' });
  };

  const setPostStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('posts').update({ status, is_published: status === 'published' }).eq('id', id);
    if (error) return toast({ title: error.message, variant: 'destructive' });
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status, is_published: status === 'published' } : p));
    toast({ title: `Post → ${status}` });
  };

  const setEventStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('events').update({ status }).eq('id', id);
    if (error) return toast({ title: error.message, variant: 'destructive' });
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    toast({ title: `Event → ${status}` });
  };

  const saveEvent = async () => {
    if (!editEvent) return;
    const { error } = await supabase.from('events').update({
      title: editEvent.title, description: editEvent.description,
      location: editEvent.location, status: editEvent.status,
    }).eq('id', editEvent.id);
    if (error) return toast({ title: error.message, variant: 'destructive' });
    setEvents(prev => prev.map(e => e.id === editEvent.id ? { ...e, ...editEvent } : e));
    setEditEvent(null); toast({ title: 'Event updated' });
  };

  const saveCommunity = async () => {
    if (!editCommunity) return;
    const { error } = await supabase.from('communities').update({
      name: editCommunity.name, description: editCommunity.description, is_private: editCommunity.is_private,
    }).eq('id', editCommunity.id);
    if (error) return toast({ title: error.message, variant: 'destructive' });
    setCommunities(prev => prev.map(c => c.id === editCommunity.id ? { ...c, ...editCommunity } : c));
    setEditCommunity(null); toast({ title: 'Community updated' });
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user profile?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) return toast({ title: error.message, variant: 'destructive' });
    setUsers(prev => prev.filter(u => u.id !== id));
    toast({ title: 'User deleted' });
  };

  const deleteCommunity = async (id: string) => {
    const { error } = await supabase.from('communities').delete().eq('id', id);
    if (error) return toast({ title: error.message, variant: 'destructive' });
    setCommunities(prev => prev.filter(c => c.id !== id));
    toast({ title: 'Community deleted' });
  };

  const saveAd = async () => {
    if (!editAd) return;
    const payload = {
      title: editAd.title, description: editAd.description, image_url: editAd.image_url,
      link_url: editAd.link_url, placement: editAd.placement || 'feed',
      is_active: !!editAd.is_active, ends_at: editAd.ends_at || null,
    };
    if (editAd.id) {
      const { error } = await supabase.from('advertisements').update(payload).eq('id', editAd.id);
      if (error) return toast({ title: error.message, variant: 'destructive' });
      setAds(prev => prev.map(a => a.id === editAd.id ? { ...a, ...payload } : a));
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('advertisements').insert({ ...payload, created_by: user?.id }).select().single();
      if (error) return toast({ title: error.message, variant: 'destructive' });
      if (data) setAds(prev => [data, ...prev]);
    }
    setEditAd(null); toast({ title: 'Ad saved' });
  };

  const deleteAd = async (id: string) => {
    if (!confirm('Delete ad?')) return;
    const { error } = await supabase.from('advertisements').delete().eq('id', id);
    if (error) return toast({ title: error.message, variant: 'destructive' });
    setAds(prev => prev.filter(a => a.id !== id));
  };

  const toggleAd = async (ad: any) => {
    const { error } = await supabase.from('advertisements').update({ is_active: !ad.is_active }).eq('id', ad.id);
    if (error) return toast({ title: error.message, variant: 'destructive' });
    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: !ad.is_active } : a));
  };

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
    const [usersRes, postsRes, eventsRes, communitiesRes, adsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('posts').select('*, profiles(name, avatar_url)').order('created_at', { ascending: false }).limit(50),
      supabase.from('events').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('communities').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('advertisements').select('*').order('created_at', { ascending: false }),
    ]);
    if (adsRes.data) setAds(adsRes.data);
    if (usersRes.data) {
      setUsers(usersRes.data);
      // Calculate stats from real data
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const thisWeekUsers = usersRes.data.filter(u => new Date(u.created_at) >= weekAgo).length;
      const lastWeekUsers = usersRes.data.filter(u => new Date(u.created_at) >= twoWeeksAgo && new Date(u.created_at) < weekAgo).length;
      setWeeklyGrowth(lastWeekUsers > 0 ? Math.round(((thisWeekUsers - lastWeekUsers) / lastWeekUsers) * 100) : thisWeekUsers > 0 ? 100 : 0);

      const todayActive = usersRes.data.filter(u => new Date(u.updated_at) >= todayStart).length;
      setActiveToday(todayActive);

      const totalUsers = usersRes.data.length;
      const returning = usersRes.data.filter(u => {
        const created = new Date(u.created_at);
        const updated = new Date(u.updated_at);
        return (updated.getTime() - created.getTime()) > 24 * 60 * 60 * 1000;
      }).length;
      setRetentionRate(totalUsers > 0 ? Math.round((returning / totalUsers) * 100) : 0);
    }
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
      toast({ title: t('admin.roleAssigned') || 'Role assigned successfully' });
      setRoleDialogOpen(false);
    } catch (err: any) {
      toast({ title: err?.message || t('admin.roleError') || 'Error assigning role', variant: 'destructive' });
    }
  };

  const handleDeletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({ title: t('admin.postDeleted') || 'Post deleted' });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (!error) {
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast({ title: t('admin.eventDeleted') || 'Event deleted' });
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (userType: string) => {
    switch (userType) {
      case 'agent': return <Badge className="bg-blue-100 text-blue-800">{t('admin.agent') || 'Agent'}</Badge>;
      case 'organization': return <Badge className="bg-teal-100 text-teal-800">{t('admin.organization') || 'Organization'}</Badge>;
      default: return <Badge variant="secondary">{t('admin.talent') || 'Talent'}</Badge>;
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t('common.loading') || 'Loading...'}</div>;

  if (currentUserRole !== 'admin' && currentUserRole !== 'moderator') {
    return (
      <div className="p-8 text-center">
        <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">{t('admin.accessDenied') || 'Access Denied'}</h2>
        <p className="text-muted-foreground">{t('admin.noPermission') || 'You do not have permission to access this page.'}</p>
        <Button className="mt-4" onClick={() => navigate('/')}>{t('common.goHome') || 'Go Home'}</Button>
      </div>
    );
  }

  const stats = [
    { label: t('admin.totalUsers') || 'Total Users', value: users.length.toString(), icon: Users, color: 'text-blue-600' },
    { label: t('admin.totalPosts') || 'Total Posts', value: posts.length.toString(), icon: FileText, color: 'text-green-600' },
    { label: t('admin.totalEvents') || 'Total Events', value: events.length.toString(), icon: Calendar, color: 'text-purple-600' },
    { label: t('admin.totalCommunities') || 'Communities', value: communities.length.toString(), icon: Building2, color: 'text-amber-600' },
  ];

  const liveStats = [
    { label: t('admin.weeklyGrowth') || 'Weekly Growth', value: `${weeklyGrowth >= 0 ? '+' : ''}${weeklyGrowth}%`, icon: TrendingUp, color: 'text-emerald-600' },
    { label: t('admin.activeToday') || 'Active Today', value: activeToday.toString(), icon: Activity, color: 'text-cyan-600' },
    { label: t('admin.retentionRate') || 'Retention Rate', value: `${retentionRate}%`, icon: BarChart3, color: 'text-orange-600' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t('admin.panel') || 'Admin Panel'}</h1>
            <p className="text-sm text-muted-foreground">
              {currentUserRole === 'admin' ? (t('admin.superAdmin') || 'Super Admin') : (t('admin.moderator') || 'Moderator')}
            </p>
          </div>
        </div>
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><UserPlus className="h-4 w-4 mr-2" />{t('admin.assignRole') || 'Assign Role'}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('admin.assignRole') || 'Assign Role'}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Select value={selectedUserId || ''} onValueChange={setSelectedUserId}>
                <SelectTrigger><SelectValue placeholder={t('admin.selectUser') || 'Select user'} /></SelectTrigger>
                <SelectContent>
                  {users.slice(0, 20).map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">{t('admin.moderator') || 'Moderator'}</SelectItem>
                  <SelectItem value="user">{t('admin.user') || 'User'}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAssignRole} className="w-full">{t('admin.confirm') || 'Confirm'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-4">
        {liveStats.map((stat, i) => (
          <Card key={i} className="border-dashed">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">{t('admin.overview') || 'Overview'}</TabsTrigger>
          <TabsTrigger value="users">{t('admin.userManagement') || 'Users'}</TabsTrigger>
          <TabsTrigger value="content">{t('admin.contentManagement') || 'Content'}</TabsTrigger>
          <TabsTrigger value="events">{t('admin.eventsManagement') || 'Events'}</TabsTrigger>
          <TabsTrigger value="moderation">{t('admin.contentModeration') || 'Moderation'}</TabsTrigger>
          <TabsTrigger value="communities"><Building2 className="h-4 w-4 mr-1" />Communities</TabsTrigger>
          <TabsTrigger value="ads"><Megaphone className="h-4 w-4 mr-1" />Реклама</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-red-500" />{t('admin.superAdmin') || 'Super Admin'}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{t('admin.superAdminDesc') || 'Full platform access and management'}</p>
                <Badge className="bg-red-100 text-red-800">{t('admin.fullAccess') || 'Full Access'}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lock className="h-5 w-5 text-blue-500" />{t('admin.moderator') || 'Moderator'}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{t('admin.moderatorDesc') || 'Content moderation and user support'}</p>
                <Badge className="bg-blue-100 text-blue-800">{t('admin.limitedAccess') || 'Limited Access'}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-gray-500" />{t('admin.user') || 'User'}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{t('admin.userDesc') || 'Standard platform access'}</p>
                <Badge variant="secondary">{t('admin.standardAccess') || 'Standard Access'}</Badge>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>{t('admin.recentUsers') || 'Recent Users'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.slice(0, 5).map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="text-xs">{user.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    {getRoleBadge(user.user_type)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('admin.searchUsers') || 'Search users...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.name') || 'Name'}</TableHead>
                    <TableHead>{t('admin.email') || 'Email'}</TableHead>
                    <TableHead>{t('admin.type') || 'Type'}</TableHead>
                    <TableHead>{t('admin.country') || 'Country'}</TableHead>
                    <TableHead>{t('admin.joined') || 'Joined'}</TableHead>
                    <TableHead>{t('admin.actions') || 'Actions'}</TableHead>
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
                          <Button size="sm" variant="ghost" onClick={() => setEditUser({ ...user })}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedUserId(user.id); setRoleDialogOpen(true); }}><Lock className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteUser(user.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
            <CardHeader><CardTitle>{t('admin.allPosts') || 'All Posts'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm">{post.profiles?.name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                        <Badge variant={post.status === 'published' ? 'default' : post.status === 'hidden' ? 'destructive' : 'secondary'} className="text-[10px]">
                          {post.status || 'published'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{post.content}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" title="Publish" onClick={() => setPostStatus(post.id, 'published')}><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                      <Button size="sm" variant="ghost" title="Hide" onClick={() => setPostStatus(post.id, 'hidden')}><EyeOff className="h-4 w-4 text-orange-600" /></Button>
                      <Button size="sm" variant="ghost" title="Draft" onClick={() => setPostStatus(post.id, 'draft')}><FileEdit className="h-4 w-4 text-blue-600" /></Button>
                      <Button size="sm" variant="outline" onClick={() => setEditPost({ ...post })}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeletePost(post.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && <p className="text-muted-foreground text-center py-4">{t('admin.noContent') || 'No content yet'}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t('admin.allEvents') || 'All Events'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{event.title}</p>
                        <Badge variant={event.status === 'published' ? 'default' : event.status === 'hidden' ? 'destructive' : 'secondary'} className="text-[10px]">
                          {event.status || 'published'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.location || '—'} • {new Date(event.start_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" title="Publish" onClick={() => setEventStatus(event.id, 'published')}><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                      <Button size="sm" variant="ghost" title="Hide" onClick={() => setEventStatus(event.id, 'hidden')}><EyeOff className="h-4 w-4 text-orange-600" /></Button>
                      <Button size="sm" variant="ghost" title="Draft" onClick={() => setEventStatus(event.id, 'draft')}><FileEdit className="h-4 w-4 text-blue-600" /></Button>
                      <Button size="sm" variant="outline" onClick={() => setEditEvent({ ...event })}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && <p className="text-muted-foreground text-center py-4">{t('admin.noContent') || 'No content yet'}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t('admin.contentModeration') || 'Content Moderation'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.slice(0, 5).map((post, i) => (
                  <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{t('admin.reportedPost') || 'Post'} #{i + 1}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-md">{post.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline"><CheckCircle className="h-4 w-4 mr-1" />{t('admin.approve') || 'Approve'}</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeletePost(post.id)}><Trash2 className="h-4 w-4 mr-1" />{t('admin.remove') || 'Remove'}</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communities Tab */}
        <TabsContent value="communities" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Communities</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {communities.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{c.name}</p>
                        {c.is_private && <Badge variant="secondary" className="text-[10px]"><Lock className="h-3 w-3 mr-1" />Private</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{c.description || '—'}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setEditCommunity({ ...c })}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteCommunity(c.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {communities.length === 0 && <p className="text-muted-foreground text-center py-4">No communities</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ads Tab */}
        <TabsContent value="ads" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" />Реклама</CardTitle>
              <Button size="sm" onClick={() => setEditAd({ title: '', placement: 'feed', is_active: true })}>
                <Plus className="h-4 w-4 mr-1" />Новое
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ads.map(ad => (
                  <div key={ad.id} className="flex items-center justify-between p-3 border rounded-lg gap-3">
                    {ad.image_url && <img src={ad.image_url} alt="" className="h-14 w-20 object-cover rounded" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{ad.title}</p>
                        <Badge variant="outline" className="text-[10px]">{ad.placement}</Badge>
                        <Badge variant={ad.is_active ? 'default' : 'secondary'} className="text-[10px]">
                          {ad.is_active ? 'Активна' : 'Выкл'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{ad.link_url || ad.description || '—'}</p>
                      <p className="text-[10px] text-muted-foreground">👁 {ad.views_count} • 🖱 {ad.clicks_count}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch checked={ad.is_active} onCheckedChange={() => toggleAd(ad)} />
                      <Button size="sm" variant="outline" onClick={() => setEditAd({ ...ad })}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteAd(ad.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {ads.length === 0 && <p className="text-muted-foreground text-center py-6">Нет рекламы. Нажмите «Новое» чтобы создать.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editUser.name || ''} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} /></div>
              <div><Label>Bio</Label><Textarea value={editUser.bio || ''} onChange={(e) => setEditUser({ ...editUser, bio: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>City</Label><Input value={editUser.city || ''} onChange={(e) => setEditUser({ ...editUser, city: e.target.value })} /></div>
                <div><Label>Country</Label><Input value={editUser.country || ''} onChange={(e) => setEditUser({ ...editUser, country: e.target.value })} /></div>
              </div>
              <div>
                <Label>User Type</Label>
                <Select value={editUser.user_type || 'talent'} onValueChange={(v) => setEditUser({ ...editUser, user_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="talent">Talent</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={saveUser}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={!!editPost} onOpenChange={(o) => !o && setEditPost(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Post</DialogTitle></DialogHeader>
          {editPost && (
            <div className="space-y-3">
              <div><Label>Content</Label><Textarea rows={5} value={editPost.content || ''} onChange={(e) => setEditPost({ ...editPost, content: e.target.value })} /></div>
              <div>
                <Label>Visibility</Label>
                <Select value={editPost.visibility || 'public'} onValueChange={(v) => setEditPost({ ...editPost, visibility: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="link">Link only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editPost.status || 'published'} onValueChange={(v) => setEditPost({ ...editPost, status: v, is_published: v === 'published' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="published">Опубликован</SelectItem>
                    <SelectItem value="hidden">Скрыт</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPost(null)}>Cancel</Button>
            <Button onClick={savePost}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={!!editEvent} onOpenChange={(o) => !o && setEditEvent(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
          {editEvent && (
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={editEvent.title || ''} onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editEvent.description || ''} onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })} /></div>
              <div><Label>Location</Label><Input value={editEvent.location || ''} onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })} /></div>
              <div>
                <Label>Status</Label>
                <Select value={editEvent.status || 'published'} onValueChange={(v) => setEditEvent({ ...editEvent, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="published">Опубликован</SelectItem>
                    <SelectItem value="hidden">Скрыт</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEvent(null)}>Cancel</Button>
            <Button onClick={saveEvent}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Community Dialog */}
      <Dialog open={!!editCommunity} onOpenChange={(o) => !o && setEditCommunity(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Редактировать сообщество</DialogTitle></DialogHeader>
          {editCommunity && (
            <div className="space-y-3">
              <div><Label>Название</Label><Input value={editCommunity.name || ''} onChange={(e) => setEditCommunity({ ...editCommunity, name: e.target.value })} /></div>
              <div><Label>Описание</Label><Textarea rows={4} value={editCommunity.description || ''} onChange={(e) => setEditCommunity({ ...editCommunity, description: e.target.value })} /></div>
              <div className="flex items-center justify-between">
                <Label>Приватное сообщество</Label>
                <Switch checked={!!editCommunity.is_private} onCheckedChange={(v) => setEditCommunity({ ...editCommunity, is_private: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCommunity(null)}>Отмена</Button>
            <Button onClick={saveCommunity}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Ad Dialog */}
      <Dialog open={!!editAd} onOpenChange={(o) => !o && setEditAd(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editAd?.id ? 'Редактировать рекламу' : 'Новая реклама'}</DialogTitle></DialogHeader>
          {editAd && (
            <div className="space-y-3">
              <div><Label>Заголовок *</Label><Input value={editAd.title || ''} onChange={(e) => setEditAd({ ...editAd, title: e.target.value })} /></div>
              <div><Label>Описание</Label><Textarea rows={2} value={editAd.description || ''} onChange={(e) => setEditAd({ ...editAd, description: e.target.value })} /></div>
              <div><Label>URL изображения</Label><Input placeholder="https://..." value={editAd.image_url || ''} onChange={(e) => setEditAd({ ...editAd, image_url: e.target.value })} /></div>
              <div><Label>Ссылка</Label><Input placeholder="https://..." value={editAd.link_url || ''} onChange={(e) => setEditAd({ ...editAd, link_url: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Размещение</Label>
                  <Select value={editAd.placement || 'feed'} onValueChange={(v) => setEditAd({ ...editAd, placement: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feed">Лента</SelectItem>
                      <SelectItem value="sidebar">Боковая панель</SelectItem>
                      <SelectItem value="banner">Баннер</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Окончание</Label>
                  <Input type="datetime-local" value={editAd.ends_at ? new Date(editAd.ends_at).toISOString().slice(0,16) : ''} onChange={(e) => setEditAd({ ...editAd, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Активна</Label>
                <Switch checked={!!editAd.is_active} onCheckedChange={(v) => setEditAd({ ...editAd, is_active: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAd(null)}>Отмена</Button>
            <Button onClick={saveAd} disabled={!editAd?.title}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
