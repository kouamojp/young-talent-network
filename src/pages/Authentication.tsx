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
import { useLanguage } from '@/i18n/LanguageContext';
import CategoryPicker from '@/components/categories/CategoryPicker';

const Authentication: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'talent' | 'organization' | 'agent'>('talent');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [bioText, setBioText] = useState('');
  const [suggestedCategoryIds, setSuggestedCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/profile');
    });
  }, [navigate]);

  // Debounced AI category suggestions based on bio/skills text
  useEffect(() => {
    const text = bioText.trim();
    if (text.length < 8) { setSuggestedCategoryIds([]); return; }
    const handle = setTimeout(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('suggest-categories', { body: { text } });
        if (!error && data?.suggestions) setSuggestedCategoryIds(data.suggestions);
      } catch (e) { /* ignore */ }
    }, 700);
    return () => clearTimeout(handle);
  }, [bioText]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast({
        title: t('auth.resetEmailSent') || 'Email envoyé',
        description: t('auth.resetEmailSentDesc') || 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.',
      });
      setShowReset(false);
      setResetEmail('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

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
        toast({ title: t('auth.welcomeBack'), description: t('auth.loginSuccess') });
        navigate('/profile');
      }
    } catch (error: any) {
      toast({ title: t('auth.loginFailed'), description: error.message, variant: "destructive" });
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
        // Save selected categories
        if (selectedCategories.length > 0) {
          const rows = selectedCategories.map((category_id) => ({ user_id: data.user!.id, category_id }));
          await supabase.from('user_yat_categories').insert(rows);
        }
        toast({ title: t('auth.accountCreated'), description: t('auth.accountCreatedDesc') });
        navigate('/profile');
      }
    } catch (error: any) {
      toast({ title: t('auth.registerFailed'), description: error.message, variant: "destructive" });
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
      toast({ title: t('auth.facebookFailed'), description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const UserTypeSelector = () => (
    <div className="space-y-2">
      <Label>{t('auth.iAm')}</Label>
      <Select value={userType} onValueChange={(v: 'talent' | 'organization' | 'agent') => setUserType(v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="talent">
            <div className="flex items-center gap-2"><Users className="h-4 w-4" /><span>{t('auth.talent')}</span></div>
          </SelectItem>
          <SelectItem value="agent">
            <div className="flex items-center gap-2"><UserCheck className="h-4 w-4" /><span>{t('auth.agent')}</span></div>
          </SelectItem>
          <SelectItem value="organization">
            <div className="flex items-center gap-2"><Building className="h-4 w-4" /><span>{t('auth.organization')}</span></div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const getNameLabel = () => {
    switch (userType) {
      case 'organization': return t('auth.orgName');
      case 'agent': return t('auth.agentName');
      default: return t('auth.fullName');
    }
  };

  const getCreateButtonText = () => {
    if (isLoading) return t('auth.creating');
    switch (userType) {
      case 'organization': return t('auth.createOrg');
      case 'agent': return t('auth.createAgent');
      default: return t('auth.createTalent');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-secondary/5 p-4">
      <GlassMorphism className="w-full max-w-md p-6">
        <AnimatedText text={t('auth.title')} tag="h1" className="text-2xl font-bold text-center mb-2" />
        <p className="text-center text-muted-foreground text-sm mb-6">{t('auth.subtitle')}</p>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
            <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>{t('auth.loginTitle')}</CardTitle>
                <CardDescription>{t('auth.loginDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input id="email" name="email" type="email" placeholder={t('auth.emailPlaceholder')} required autoComplete="username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <Input id="password" name="password" type="password" required autoComplete="current-password" />
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowReset(v => !v)}
                      className="text-xs text-primary hover:underline"
                    >
                      {t('auth.forgotPassword') || 'Mot de passe oublié ?'}
                    </button>
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? t('auth.loggingIn') : t('auth.loginButton')}
                  </Button>
                </form>
                {showReset && (
                  <form onSubmit={handlePasswordReset} className="mt-4 space-y-3 p-3 border rounded-lg bg-muted/40">
                    <Label htmlFor="reset-email" className="text-sm font-medium">
                      {t('auth.resetTitle') || 'Réinitialiser le mot de passe'}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t('auth.resetDesc') || 'Saisissez votre email pour recevoir un lien de réinitialisation.'}
                    </p>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={isLoading} className="flex-1">
                        {isLoading ? '…' : (t('auth.sendResetLink') || 'Envoyer le lien')}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowReset(false)}>
                        {t('common.cancel') || 'Annuler'}
                      </Button>
                    </div>
                  </form>
                )}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">{t('common.or')}</span></div>
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
                <CardTitle>{t('auth.registerTitle')}</CardTitle>
                <CardDescription>{t('auth.registerDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <UserTypeSelector />
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">{getNameLabel()}</Label>
                    <Input id="reg-name" name="name" placeholder={userType === 'organization' ? t('auth.orgPlaceholder') : t('auth.namePlaceholder')} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">{t('auth.email')}</Label>
                    <Input id="reg-email" name="email" type="email" placeholder={t('auth.emailPlaceholder')} required autoComplete="username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">{t('auth.password')}</Label>
                    <Input id="reg-password" name="password" type="password" required autoComplete="new-password" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('categories.yourCategories') || 'Your categories'}</Label>
                    <CategoryPicker selected={selectedCategories} onChange={setSelectedCategories} max={3} />
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {getCreateButtonText()}
                  </Button>
                </form>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">{t('common.or')}</span></div>
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
