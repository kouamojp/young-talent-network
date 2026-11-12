import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { invokeFunction } from '@/lib/invokeFunction';
import { ageFromBirthday, MIN_AGE, PARENTAL_CONSENT_AGE } from '@/lib/age';
import { tr } from '@/i18n';

interface ComplianceStatus {
  user_type: string;
  birthday_set: boolean;
  age: number | null;
  is_minor: boolean;
  consent_required: boolean;
  consent_status: 'pending' | 'granted' | 'revoked' | null;
  parent_email: string | null;
  last_sent_at: string | null;
}

// Pages où le contrôle ne s'affiche pas (le parent n'est pas connecté, et les
// pages légales doivent rester lisibles).
const EXEMPT_PATHS = ['/auth', '/reset-password', '/accord-parental', '/legal'];

/**
 * Contrôle de conformité pour le compte connecté :
 *  - demande la date de naissance aux comptes qui n'en ont pas (inscriptions OAuth, anciens comptes) ;
 *  - affiche un bandeau tant que l'accord parental (13-14 ans) n'est pas donné,
 *    et envoie automatiquement le premier e-mail au parent.
 */
const ComplianceGate: React.FC = () => {
  const location = useLocation();
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<ComplianceStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const autoSent = useRef(false);

  const refresh = useCallback(async () => {
    const { data } = await (supabase.rpc as any)('my_compliance_status');
    setStatus((data as ComplianceStatus) ?? null);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUserId(session?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) refresh();
    else setStatus(null);
  }, [userId, refresh]);

  const sendConsentEmail = useCallback(async (silent = false) => {
    const { error } = await invokeFunction('parental-consent', { action: 'send' });
    if (error) {
      if (!silent) toast({ title: tr('complianceGate.emailNotSent'), description: error, variant: 'destructive' });
      return false;
    }
    if (!silent) toast({ title: tr('complianceGate.emailSent'), description: tr('complianceGate.askYourParentToClickThe') });
    await refresh();
    return true;
  }, [refresh]);

  // Premier envoi automatique, une seule fois par session.
  useEffect(() => {
    if (status?.consent_required && status.parent_email && !status.last_sent_at && !autoSent.current) {
      autoSent.current = true;
      sendConsentEmail(true);
    }
  }, [status, sendConsentEmail]);

  if (!userId || !status) return null;
  if (EXEMPT_PATHS.some(p => location.pathname.startsWith(p))) return null;

  return (
    <>
      {!status.birthday_set && status.user_type !== 'organization' && (
        <BirthdayDialog open={!dismissed} onDismiss={() => setDismissed(true)} onSaved={refresh} />
      )}
      {status.consent_required && (
        <ConsentBanner status={status} onResend={() => sendConsentEmail(false)} onEmailChanged={refresh} />
      )}
    </>
  );
};

const BirthdayDialog: React.FC<{ open: boolean; onDismiss: () => void; onSaved: () => void }> = ({ open, onDismiss, onSaved }) => {
  const [birthday, setBirthday] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const age = ageFromBirthday(birthday);
  const tooYoung = age !== null && age < MIN_AGE;
  const needsParent = age !== null && age >= MIN_AGE && age < PARENTAL_CONSENT_AGE;

  const save = async () => {
    setSaving(true);
    const { error } = await (supabase.rpc as any)('set_my_birthday', {
      _birthday: birthday,
      _parent_email: needsParent ? parentEmail.trim() : null,
    });
    setSaving(false);
    if (error) { toast({ title: tr('common.couldNotSave'), description: error.message, variant: 'destructive' }); return; }
    toast({ title: tr('complianceGate.dateOfBirthSaved') });
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onDismiss(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tr('complianceGate.yourDateOfBirth')}</DialogTitle>
          <DialogDescription>
            {tr('complianceGate.itIsOnlyUsedToProtect')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="gate-birthday">{tr('auth.birthday')}</Label>
            <Input id="gate-birthday" type="date" max={new Date().toISOString().slice(0, 10)} value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </div>
          {tooYoung && (
            <p className="text-sm text-destructive">
              {tr('complianceGate.yatIsForPeopleAged')} {MIN_AGE} {tr('complianceGate.andOverYouCanDeleteYour')}{' '}
              <Link to="/settings" className="underline" onClick={onDismiss}>{tr('sidebar.settings')}</Link>.
            </p>
          )}
          {needsParent && (
            <div className="space-y-1.5">
              <Label htmlFor="gate-parent-email">{tr('auth.parentEmail')}</Label>
              <Input id="gate-parent-email" type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="parent@exemple.com" />
              <p className="text-xs text-muted-foreground">{tr('complianceGate.under')} {PARENTAL_CONSENT_AGE} {tr('complianceGate.aParentMustApproveYourAccount')}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>{tr('complianceGate.later')}</Button>
          <Button onClick={save} disabled={!birthday || tooYoung || saving || (needsParent && !parentEmail.includes('@'))}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {tr('post.update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ConsentBanner: React.FC<{ status: ComplianceStatus; onResend: () => Promise<boolean>; onEmailChanged: () => void }> = ({ status, onResend, onEmailChanged }) => {
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const resend = async () => { setSending(true); await onResend(); setSending(false); };

  const changeEmail = async () => {
    setSaving(true);
    const { error } = await (supabase.rpc as any)('set_parent_email', { _parent_email: email.trim() });
    if (error) {
      setSaving(false);
      toast({ title: tr('complianceGate.couldNotUpdate'), description: error.message, variant: 'destructive' });
      return;
    }
    await onEmailChanged();
    await onResend();
    setSaving(false);
    setEditing(false);
    setEmail('');
  };

  return (
    <div className="border-b border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 px-4 py-3">
      <div className="max-w-4xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 text-sm">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
          <p>
            <strong>{tr('complianceGate.parentalConsentPending')}</strong>{' '}
            {status.parent_email
              ? <>{tr('complianceGate.anEmail')} {status.last_sent_at ? tr('complianceGate.wasSent') : tr('complianceGate.willBeSent')} à {status.parent_email}{tr('complianceGate.messagingWillBeAvailableAsSoon')}</>
              : <>{tr('complianceGate.enterAParentSEmailTo')}</>}
          </p>
        </div>
        {editing || !status.parent_email ? (
          <div className="flex gap-2 shrink-0">
            <Input type="email" aria-label={tr('complianceGate.parentSEmail')} placeholder="parent@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 w-52 bg-background" />
            <Button size="sm" onClick={changeEmail} disabled={!email.includes('@') || saving}>
              {saving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}{tr('common.send')}
            </Button>
            {status.parent_email && <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>{tr('common.cancel')}</Button>}
          </div>
        ) : (
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={resend} disabled={sending}>
              {sending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}{tr('complianceGate.resendEmail')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>{tr('complianceGate.changeAddress')}</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceGate;
