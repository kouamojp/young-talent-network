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
import { Apple, Users, Building, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import CategoryPicker from '@/components/categories/CategoryPicker';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.48-1.12 2.73-2.39 3.58v2.97h3.86c2.26-2.08 3.58-5.15 3.58-8.79z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.94l-3.86-2.97c-1.07.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/>
    <path fill="#FBBC05" d="M5.27 14.29A7.21 7.21 0 0 1 4.88 12c0-.79.14-1.56.39-2.29V6.62H1.29A11.99 11.99 0 0 0 0 12c0 1.94.47 3.78 1.29 5.38l3.98-3.09z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"/>
  </svg>
);

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
        redirectTo: `${window.location.origin}/reset-password`,
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

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(typeof result.error === 'string' ? result.error : 'OAuth error');
      if (result.redirected) return;
      navigate('/profile');
    } catch (error: any) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const SocialButtons = () => (
    <div className="grid grid-cols-1 gap-2">
      <Button variant="outline" className="w-full" onClick={() => handleOAuth('google')} disabled={isLoading}>
        <GoogleIcon /> Google
      </Button>
      <Button variant="outline" className="w-full" onClick={() => handleOAuth('apple')} disabled={isLoading}>
        <Apple className="mr-2 h-4 w-4" /> Apple
      </Button>
    </div>
  );


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
                    <Label htmlFor="reg-bio">{t('auth.skillsBio') || 'Your skills / bio'}</Label>
                    <textarea
                      id="reg-bio"
                      rows={2}
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      placeholder={t('auth.skillsBioPlaceholder') || 'Describe your skills (e.g. football coach, web developer, jazz singer)'}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('categories.yourCategories') || 'Your categories'}</Label>
                    <CategoryPicker
                      selected={selectedCategories}
                      onChange={setSelectedCategories}
                      max={3}
                      suggestions={suggestedCategoryIds}
                    />
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
