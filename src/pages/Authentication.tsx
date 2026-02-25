import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GlassMorphism from '@/components/GlassMorphism';
import AnimatedText from '@/components/AnimatedText';
import { Facebook, Users, Building, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Authentication: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'talent' | 'organization' | 'agent'>('talent');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/profile');
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.session) {
        toast({ title: "Bienvenue !", description: "Connexion réussie." });
        navigate('/profile');
      }
    } catch (error: any) {
      toast({ title: "Échec de connexion", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { user_type: userType, name },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      if (data.user) {
        toast({ title: "Compte créé !", description: "Bienvenue sur YAT ! Votre profil a été créé automatiquement dans toutes les sections." });
        navigate('/profile');
      }
    } catch (error: any) {
      toast({ title: "Échec d'inscription", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'facebook' });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: "Échec Facebook", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const UserTypeSelector = () => (
    <div className="space-y-2">
      <Label>Je suis...</Label>
      <Select value={userType} onValueChange={(v: 'talent' | 'organization' | 'agent') => setUserType(v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="talent">
            <div className="flex items-center gap-2"><Users className="h-4 w-4" /><span>Talent</span></div>
          </SelectItem>
          <SelectItem value="agent">
            <div className="flex items-center gap-2"><UserCheck className="h-4 w-4" /><span>Agent / Représentant</span></div>
          </SelectItem>
          <SelectItem value="organization">
            <div className="flex items-center gap-2"><Building className="h-4 w-4" /><span>Organisation / Club / École</span></div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const getNameLabel = () => {
    switch (userType) {
      case 'organization': return 'Nom de l\'organisation';
      case 'agent': return 'Nom complet de l\'agent';
      default: return 'Nom complet';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-secondary/5 p-4">
      <GlassMorphism className="w-full max-w-md p-6">
        <AnimatedText text="Young & Talented" tag="h1" className="text-2xl font-bold text-center mb-2" />
        <p className="text-center text-muted-foreground text-sm mb-6">Я Талант — Plateforme mondiale pour jeunes talents</p>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="register">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Connexion</CardTitle>
                <CardDescription>Accédez à votre compte YAT</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="votre@email.com" required autoComplete="username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input id="password" name="password" type="password" required autoComplete="current-password" />
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? "Connexion..." : "Se Connecter"}
                  </Button>
                </form>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Ou</span></div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleFacebookLogin} disabled={isLoading}>
                  <Facebook className="mr-2 h-4 w-4" /> Facebook
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Inscription Gratuite</CardTitle>
                <CardDescription>Créez votre profil YAT — vos profils seront créés automatiquement dans toutes les sections</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <UserTypeSelector />
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">{getNameLabel()}</Label>
                    <Input id="reg-name" name="name" placeholder={userType === 'organization' ? 'Nom du club/école' : 'Prénom Nom'} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" name="email" type="email" placeholder="votre@email.com" required autoComplete="username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Mot de passe</Label>
                    <Input id="reg-password" name="password" type="password" required autoComplete="new-password" />
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? "Création..." : `Créer mon compte ${userType === 'organization' ? 'Organisation' : userType === 'agent' ? 'Agent' : 'Talent'}`}
                  </Button>
                </form>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Ou</span></div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleFacebookLogin} disabled={isLoading}>
                  <Facebook className="mr-2 h-4 w-4" /> Facebook
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </GlassMorphism>
    </div>
  );
};

export default Authentication;
