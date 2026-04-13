import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, Activity, AlertTriangle, Search, Settings, BarChart3, Eye, Trash2, Ban, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const sampleUsers = [
  { id: '1', name: 'Alex Chen', email: 'alex@example.com', role: 'admin', status: 'active', joined: '2025-01-15' },
  { id: '2', name: 'Maria Rodriguez', email: 'maria@example.com', role: 'moderator', status: 'active', joined: '2025-02-20' },
  { id: '3', name: 'David Kim', email: 'david@example.com', role: 'user', status: 'active', joined: '2025-03-10' },
  { id: '4', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'user', status: 'suspended', joined: '2025-01-28' },
  { id: '5', name: 'Emily Zhang', email: 'emily@example.com', role: 'user', status: 'active', joined: '2025-04-01' },
];

const AdminPanel: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const filteredUsers = sampleUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: t('admin.totalUsers'), value: '1,247', icon: Users, color: 'text-blue-600' },
    { label: t('admin.activeToday'), value: '342', icon: Activity, color: 'text-green-600' },
    { label: t('admin.newThisWeek'), value: '56', icon: CheckCircle, color: 'text-purple-600' },
    { label: t('admin.reportedContent'), value: '12', icon: AlertTriangle, color: 'text-amber-600' },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-red-100 text-red-800">{t('admin.admin')}</Badge>;
      case 'moderator': return <Badge className="bg-blue-100 text-blue-800">{t('admin.moderator')}</Badge>;
      default: return <Badge variant="secondary">{t('admin.user')}</Badge>;
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t('admin.panel')}</h1>
            <p className="text-sm text-muted-foreground">
              {currentUserRole === 'admin' ? t('admin.superAdmin') : t('admin.moderator')}
            </p>
          </div>
        </div>
        <Button variant="outline"><Settings className="h-4 w-4 mr-2" />{t('admin.systemSettings')}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">{t('admin.userManagement')}</TabsTrigger>
          <TabsTrigger value="roles">{t('admin.manageRoles')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('admin.platformAnalytics')}</TabsTrigger>
          <TabsTrigger value="moderation">{t('admin.contentModeration')}</TabsTrigger>
        </TabsList>

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
                    <TableHead>{t('admin.role')}</TableHead>
                    <TableHead>{t('admin.status')}</TableHead>
                    <TableHead>{t('admin.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                          {user.status === 'active' ? t('admin.active') : t('admin.suspended')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost">
                            {user.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">{t('admin.superAdmin')}</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground mb-3">Full platform access, user management, system configuration</p><Badge className="bg-red-100 text-red-800">1 user</Badge></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">{t('admin.admin')}</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground mb-3">User management, content moderation, analytics access</p><Badge className="bg-blue-100 text-blue-800">3 users</Badge></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">{t('admin.moderator')}</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground mb-3">Content review, report handling, community management</p><Badge variant="secondary">8 users</Badge></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />{t('admin.platformAnalytics')}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between"><span>Daily Active Users</span><span className="font-semibold">342</span></div>
                  <div className="flex justify-between"><span>Monthly Active Users</span><span className="font-semibold">4,821</span></div>
                  <div className="flex justify-between"><span>Total Posts</span><span className="font-semibold">12,456</span></div>
                  <div className="flex justify-between"><span>Total Events</span><span className="font-semibold">89</span></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between"><span>This Week</span><span className="font-semibold text-green-600">+56</span></div>
                  <div className="flex justify-between"><span>This Month</span><span className="font-semibold text-green-600">+218</span></div>
                  <div className="flex justify-between"><span>Retention Rate</span><span className="font-semibold">78.3%</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t('admin.contentModeration')}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Reported post #{i}</p>
                      <p className="text-sm text-muted-foreground">Reported by user • 2h ago</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Review</Button>
                      <Button size="sm" variant="destructive">Remove</Button>
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
