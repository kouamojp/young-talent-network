import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Building, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import CategoryPicker from '@/components/categories/CategoryPicker';
import VKLoginButton from '@/components/auth/VKLoginButton';
import TelegramLoginButton from '@/components/auth/TelegramLoginButton';

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
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/profile`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSocialButtons = () => (
    <div className="grid grid-cols-1 gap-2">
      <Button variant="outline" className="w-full" onClick={() => handleOAuth('google')} disabled={isLoading}>
        <GoogleIcon /> Google
      </Button>
      {/* <Button variant="outline" className="w-full" onClick={() => handleOAuth('apple')} disabled={isLoading}>
        <Apple className="mr-2 h-4 w-4" /> Apple
      </Button> */}
      <VKLoginButton />
      <TelegramLoginButton />
    </div>
  );


  const userTypes = [
    { value: 'talent' as const, icon: Users, label: t('auth.talent') },
    { value: 'agent' as const, icon: UserCheck, label: t('auth.agent') },
    { value: 'organization' as const, icon: Building, label: t('auth.organization') },
  ];

  const renderUserTypeSelector = () => (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium mb-2">{t('auth.iAm')}</legend>
      <div className="grid grid-cols-3 gap-2">
        {userTypes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={userType === value}
            onClick={() => setUserType(value)}
            className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium leading-tight text-center transition-colors ${
              userType === value
                ? 'border-primary bg-accent text-accent-foreground'
                : 'border-input bg-card text-muted-foreground hover:text-foreground hover:border-primary/40'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </fieldset>
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

  const roles = [
    { icon: Users, title: t('auth.talent'), desc: t('landing.talentsDesc') },
    { icon: UserCheck, title: t('auth.agent'), desc: t('landing.agentsDesc') },
    { icon: Building, title: t('auth.organization'), desc: t('landing.orgsDesc') },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
      <section className="relative overflow-hidden bg-stage text-stage-foreground px-6 py-10 md:px-10 lg:py-16 flex flex-col justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-48 -left-32 h-[520px] w-[720px] rounded-full opacity-60"
          style={{ background: 'radial-gradient(closest-side, hsl(var(--primary) / 0.55), transparent)' }}
        />
        <div className="relative max-w-md">
          <img src="/lovable-uploads/b56312bb-24e8-4289-a96d-8651af4ddd7f.png" alt="" className="h-11 w-11 mb-6" />
          <h1 className="text-3xl md:text-[44px] font-semibold text-white">{t('auth.title')}</h1>
          <p className="mt-3 text-white/70">{t('auth.subtitle')}</p>
          <ul className="mt-8 hidden sm:block divide-y divide-white/10 border-y border-white/10">
            {roles.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex gap-4 py-4">
                <Icon className="h-5 w-5 mt-0.5 shrink-0 text-white/70" />
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="text-sm text-white/60">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="bg-card px-6 py-8 md:px-10 lg:py-14 flex flex-col justify-center">
        <Tabs defaultValue="login" className="w-full max-w-sm mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
            <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold">{t('auth.loginTitle')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t('auth.loginDesc')}</p>
              </div>
              <div>
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
                  <form onSubmit={handlePasswordReset} className="mt-4 space-y-3 p-4 border rounded-lg bg-background">
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
                <div className="flex items-center gap-3 my-5 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />{t('common.or')}<span className="h-px flex-1 bg-border" />
                </div>
                {renderSocialButtons()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="register">
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold">{t('auth.registerTitle')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t('auth.registerDesc')}</p>
              </div>
              <div>
                <form onSubmit={handleRegister} className="space-y-4">
                  {renderUserTypeSelector()}
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
                      className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                <div className="flex items-center gap-3 my-5 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />{t('common.or')}<span className="h-px flex-1 bg-border" />
                </div>
                {renderSocialButtons()}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Authentication;
