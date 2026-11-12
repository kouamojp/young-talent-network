import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlassMorphism from '@/components/GlassMorphism';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { tr } from '@/i18n';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery session in the URL hash; client picks it up automatically.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: tr('settings.error'), description: tr('resetPassword.passwordTooShortMin6Characters'), variant: 'destructive' });
      return;
    }
    if (password !== confirm) {
      toast({ title: tr('settings.error'), description: tr('resetPassword.passwordsDoNotMatch'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: t('auth.passwordUpdated') || 'Password updated', description: t('auth.canLoginNow') || tr('auth.canLoginNow') });
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (err: any) {
      toast({ title: tr('settings.error'), description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-secondary/5 p-4">
      <GlassMorphism className="w-full max-w-md p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('auth.resetTitle') || tr('auth.resetTitle')}</CardTitle>
            <CardDescription>
              {ready ? (t('auth.enterNewPassword') || tr('auth.enterNewPassword')) : (t('auth.waitingRecovery') || tr('auth.waitingRecovery'))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('auth.newPassword') || tr('auth.newPassword')}</Label>
                <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={!ready} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('auth.confirmPassword') || tr('auth.confirmPassword')}</Label>
                <Input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required disabled={!ready} />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !ready}>
                {loading ? '…' : (t('auth.updatePassword') || tr('auth.updatePassword'))}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/auth')}>
                {t('auth.backToLogin') || tr('auth.backToLogin')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </GlassMorphism>
    </div>
  );
};

export default ResetPassword;
