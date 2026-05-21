import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { 
  Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, 
  Lock, Eye, Moon, Sun, Loader2, LogOut, Trash2, Mail, Phone, MapPin, RefreshCw
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/i18n/LanguageContext';
import { YatServicesManager } from '@/components/profile/YatServicesManager';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState({
    email: true, push: true, messages: true, events: true, connections: true, marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true, showLocation: true, showEmail: false, showPhone: false,
  });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setCurrentUser({ ...profile, email: user.email });
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      name: currentUser.name, bio: currentUser.bio, phone: currentUser.phone,
      city: currentUser.city, country: currentUser.country, website: currentUser.website,
    }).eq('id', currentUser.id);

    if (error) {
      toast({ title: t('settings.error'), description: t('settings.errorSaving'), variant: 'destructive' });
    } else {
      toast({ title: t('settings.saved'), description: t('settings.savedDesc') });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const [clearing, setClearing] = useState(false);
  const handleClearCache = async () => {
    setClearing(true);
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if (typeof caches !== 'undefined') {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      try { localStorage.clear(); sessionStorage.clear(); } catch {}
      toast({ title: 'Кэш очищен', description: 'Перезагружаем страницу...' });
      setTimeout(() => window.location.reload(), 600);
    } catch (e: any) {
      toast({ title: 'Ошибка', description: e?.message || 'Не удалось очистить кэш', variant: 'destructive' });
      setClearing(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="w-full min-h-screen">
      <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/15"><SettingsIcon className="h-7 w-7" /></div>
            <div>
              <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
              <p className="text-white/80 text-sm">{t('settings.subtitle')}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { icon: User, label: t('settings.profile'), value: currentUser?.name?.[0] ? '✓' : '!' },
              { icon: Shield, label: t('settings.security'), value: '✓' },
              { icon: Bell, label: t('settings.notifications'), value: 'On' },
              { icon: Palette, label: t('settings.theme'), value: theme === 'dark' ? '🌙' : '☀️' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <stat.icon className="h-5 w-5 mx-auto mb-1 text-white/80" />
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-muted/50 flex-wrap h-auto">
            <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
            <TabsTrigger value="services">{t('services.title') || 'YAT Services'}</TabsTrigger>
            <TabsTrigger value="notifications">{t('settings.notifications')}</TabsTrigger>
            <TabsTrigger value="privacy">{t('settings.privacy')}</TabsTrigger>
            <TabsTrigger value="appearance">{t('settings.appearance')}</TabsTrigger>
            <TabsTrigger value="account">{t('settings.account')}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('settings.personalInfo')}</CardTitle>
                    <CardDescription>{t('settings.updateProfile')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="name">{t('settings.fullName')}</Label><Input id="name" value={currentUser?.name || ''} onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })} /></div>
                      <div><Label htmlFor="email">{t('auth.email')}</Label><Input id="email" value={currentUser?.email || ''} disabled className="bg-muted" /></div>
                    </div>
                    <div><Label htmlFor="bio">{t('settings.bio')}</Label><Input id="bio" value={currentUser?.bio || ''} onChange={(e) => setCurrentUser({ ...currentUser, bio: e.target.value })} placeholder={t('settings.bioPlaceholder')} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="phone"><Phone className="h-3.5 w-3.5 inline mr-1" />{t('settings.phone')}</Label><Input id="phone" value={currentUser?.phone || ''} onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })} /></div>
                      <div><Label htmlFor="website"><Globe className="h-3.5 w-3.5 inline mr-1" />{t('settings.website')}</Label><Input id="website" value={currentUser?.website || ''} onChange={(e) => setCurrentUser({ ...currentUser, website: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="city"><MapPin className="h-3.5 w-3.5 inline mr-1" />{t('settings.city')}</Label><Input id="city" value={currentUser?.city || ''} onChange={(e) => setCurrentUser({ ...currentUser, city: e.target.value })} /></div>
                      <div><Label htmlFor="country">{t('settings.country')}</Label><Input id="country" value={currentUser?.country || ''} onChange={(e) => setCurrentUser({ ...currentUser, country: e.target.value })} /></div>
                    </div>
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {t('common.save')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-3"><AvatarImage src={currentUser?.avatar_url} /><AvatarFallback className="text-2xl">{currentUser?.name?.[0] || 'U'}</AvatarFallback></Avatar>
                    <h3 className="font-semibold">{currentUser?.name}</h3>
                    <Badge variant="secondary" className="mt-1">{currentUser?.user_type}</Badge>
                    <p className="text-xs text-muted-foreground mt-2">{currentUser?.bio || t('common.noBio')}</p>
                    {currentUser?.city && <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><MapPin className="h-3 w-3" /> {currentUser.city}, {currentUser.country}</p>}
                    <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => navigate('/profile')}>{t('common.viewFullProfile')}</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services">
            <YatServicesManager />
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> {t('settings.notifPrefs')}</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'email' as const, label: t('settings.emailNotif'), desc: t('settings.emailNotifDesc'), icon: Mail },
                  { key: 'push' as const, label: t('settings.pushNotif'), desc: t('settings.pushNotifDesc'), icon: Bell },
                  { key: 'messages' as const, label: t('settings.messagesNotif'), desc: t('settings.messagesNotifDesc'), icon: Mail },
                  { key: 'events' as const, label: t('settings.eventsNotif'), desc: t('settings.eventsNotifDesc'), icon: Bell },
                  { key: 'connections' as const, label: t('settings.connectionsNotif'), desc: t('settings.connectionsNotifDesc'), icon: User },
                  { key: 'marketing' as const, label: t('settings.marketingNotif'), desc: t('settings.marketingNotifDesc'), icon: Globe },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><item.icon className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div></div>
                    <Switch checked={notifications[item.key]} onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> {t('settings.privacySecurity')}</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'profilePublic' as const, label: t('settings.publicProfile'), desc: t('settings.publicProfileDesc'), icon: Eye },
                  { key: 'showLocation' as const, label: t('settings.showLocation'), desc: t('settings.showLocationDesc'), icon: MapPin },
                  { key: 'showEmail' as const, label: t('settings.showEmail'), desc: t('settings.showEmailDesc'), icon: Mail },
                  { key: 'showPhone' as const, label: t('settings.showPhone'), desc: t('settings.showPhoneDesc'), icon: Phone },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><item.icon className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div></div>
                    <Switch checked={privacy[item.key]} onCheckedChange={(checked) => setPrivacy({ ...privacy, [item.key]: checked })} />
                  </div>
                ))}
                <Separator />
                <div><h4 className="font-medium text-sm mb-2 flex items-center gap-2"><Lock className="h-4 w-4" /> {t('settings.accountSecurity')}</h4><Button variant="outline" size="sm">{t('settings.changePassword')}</Button></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> {t('settings.appearance')}</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">{t('settings.theme')}</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: t('settings.light'), icon: Sun },
                      { value: 'dark', label: t('settings.dark'), icon: Moon },
                      { value: 'system', label: t('settings.system'), icon: SettingsIcon },
                    ].map((themeOpt) => (
                      <Button key={themeOpt.value} variant={theme === themeOpt.value ? 'default' : 'outline'} className="flex flex-col gap-2 h-auto py-4" onClick={() => toggleTheme()}>
                        <themeOpt.icon className="h-5 w-5" /><span className="text-xs">{themeOpt.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">{t('settings.accountType')}</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Badge className="text-sm">{currentUser?.user_type}</Badge>
                    <span className="text-sm text-muted-foreground">{t('common.memberSince')} {new Date(currentUser?.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" /> Кэш приложения
                  </CardTitle>
                  <CardDescription>
                    Разрегистрирует service workers и очищает кэш браузера. Полезно при странном поведении или устаревшем контенте.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="gap-2" onClick={handleClearCache} disabled={clearing}>
                    {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Очистить кэш
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-destructive/30">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-destructive"><Trash2 className="h-5 w-5" /> {t('settings.dangerZone')}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="gap-2" onClick={handleLogout}><LogOut className="h-4 w-4" /> {t('settings.logout')}</Button>
                  <div>
                    <Button variant="destructive" size="sm" className="gap-2"><Trash2 className="h-4 w-4" /> {t('settings.deleteAccount')}</Button>
                    <p className="text-xs text-muted-foreground mt-1">{t('settings.irreversible')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
