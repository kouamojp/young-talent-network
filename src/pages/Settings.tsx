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
  Lock, Eye, Moon, Sun, Loader2, LogOut, Trash2, Mail, Phone, MapPin
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Notification preferences (local state)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    messages: true,
    events: true,
    connections: true,
    marketing: false,
  });

  // Privacy preferences
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showLocation: true,
    showEmail: false,
    showPhone: false,
  });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setCurrentUser({ ...profile, email: user.email });
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: currentUser.name,
        bio: currentUser.bio,
        phone: currentUser.phone,
        city: currentUser.city,
        country: currentUser.country,
        website: currentUser.website,
      })
      .eq('id', currentUser.id);

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' });
    } else {
      toast({ title: 'Sauvegardé', description: 'Vos paramètres ont été mis à jour' });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/15">
              <SettingsIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Paramètres</h1>
              <p className="text-white/80 text-sm">Gérez votre compte et vos préférences</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { icon: User, label: 'Profil', value: currentUser?.name?.[0] ? '✓' : '!' },
              { icon: Shield, label: 'Sécurité', value: '✓' },
              { icon: Bell, label: 'Notifications', value: 'On' },
              { icon: Palette, label: 'Thème', value: theme === 'dark' ? '🌙' : '☀️' },
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

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-muted/50">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
            <TabsTrigger value="account">Compte</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations personnelles</CardTitle>
                    <CardDescription>Mettez à jour vos informations de profil</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nom complet</Label>
                        <Input 
                          id="name" 
                          value={currentUser?.name || ''} 
                          onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={currentUser?.email || ''} disabled className="bg-muted" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Input 
                        id="bio" 
                        value={currentUser?.bio || ''} 
                        onChange={(e) => setCurrentUser({ ...currentUser, bio: e.target.value })}
                        placeholder="Parlez de vous..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone"><Phone className="h-3.5 w-3.5 inline mr-1" />Téléphone</Label>
                        <Input 
                          id="phone" 
                          value={currentUser?.phone || ''} 
                          onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website"><Globe className="h-3.5 w-3.5 inline mr-1" />Site web</Label>
                        <Input 
                          id="website" 
                          value={currentUser?.website || ''} 
                          onChange={(e) => setCurrentUser({ ...currentUser, website: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city"><MapPin className="h-3.5 w-3.5 inline mr-1" />Ville</Label>
                        <Input 
                          id="city" 
                          value={currentUser?.city || ''} 
                          onChange={(e) => setCurrentUser({ ...currentUser, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Pays</Label>
                        <Input 
                          id="country" 
                          value={currentUser?.country || ''} 
                          onChange={(e) => setCurrentUser({ ...currentUser, country: e.target.value })}
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Sauvegarder
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Preview */}
              <div>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-3">
                      <AvatarImage src={currentUser?.avatar_url} />
                      <AvatarFallback className="text-2xl">{currentUser?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold">{currentUser?.name}</h3>
                    <Badge variant="secondary" className="mt-1">{currentUser?.user_type}</Badge>
                    <p className="text-xs text-muted-foreground mt-2">{currentUser?.bio || 'Aucune bio'}</p>
                    {currentUser?.city && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3" /> {currentUser.city}, {currentUser.country}
                      </p>
                    )}
                    <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => navigate('/profile')}>
                      Voir le profil complet
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" /> Préférences de notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'email' as const, label: 'Notifications par email', desc: 'Recevoir des emails pour les mises à jour importantes', icon: Mail },
                  { key: 'push' as const, label: 'Notifications push', desc: 'Notifications dans le navigateur', icon: Bell },
                  { key: 'messages' as const, label: 'Messages', desc: 'Être notifié des nouveaux messages', icon: Mail },
                  { key: 'events' as const, label: 'Événements', desc: 'Rappels et nouveaux événements', icon: Bell },
                  { key: 'connections' as const, label: 'Connexions', desc: 'Demandes de connexion et acceptations', icon: User },
                  { key: 'marketing' as const, label: 'Marketing', desc: 'Offres spéciales et recommandations', icon: Globe },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications[item.key]}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Confidentialité et sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'profilePublic' as const, label: 'Profil public', desc: 'Votre profil est visible par tout le monde', icon: Eye },
                  { key: 'showLocation' as const, label: 'Afficher la localisation', desc: 'Montrer votre ville et pays', icon: MapPin },
                  { key: 'showEmail' as const, label: 'Afficher l\'email', desc: 'Votre email visible sur votre profil', icon: Mail },
                  { key: 'showPhone' as const, label: 'Afficher le téléphone', desc: 'Votre numéro visible sur votre profil', icon: Phone },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={privacy[item.key]}
                      onCheckedChange={(checked) => setPrivacy({ ...privacy, [item.key]: checked })}
                    />
                  </div>
                ))}

                <Separator />

                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Sécurité du compte
                  </h4>
                  <Button variant="outline" size="sm">Changer le mot de passe</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" /> Apparence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Thème</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Clair', icon: Sun },
                      { value: 'dark', label: 'Sombre', icon: Moon },
                      { value: 'system', label: 'Système', icon: SettingsIcon },
                    ].map((t) => (
                      <Button
                        key={t.value}
                        variant={theme === t.value ? 'default' : 'outline'}
                        className="flex flex-col gap-2 h-auto py-4"
                        onClick={() => setTheme(t.value as any)}
                      >
                        <t.icon className="h-5 w-5" />
                        <span className="text-xs">{t.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Type de compte</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Badge className="text-sm">{currentUser?.user_type}</Badge>
                    <span className="text-sm text-muted-foreground">Membre depuis {new Date(currentUser?.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                    <Trash2 className="h-5 w-5" /> Zone dangereuse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" /> Se déconnecter
                  </Button>
                  <div>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="h-4 w-4" /> Supprimer mon compte
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Cette action est irréversible</p>
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
