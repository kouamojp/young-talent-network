import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { invokeFunction } from '@/lib/invokeFunction';
import { tr } from '@/i18n';

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; childName: string }
  | { kind: 'granted'; childName: string };

/** Page ouverte par le parent depuis l'e-mail d'accord parental. Ne demande pas de connexion. */
const ParentalConsent: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!token) { setState({ kind: 'error', message: tr('parentalConsent.incompleteLinkUseTheLinkYou') }); return; }
    invokeFunction<{ childName: string; status: string }>('parental-consent', { action: 'info', token }).then(({ data, error }) => {
      if (error || !data) {
        setState({ kind: 'error', message: error || tr('parentalConsent.thisLinkIsNoLongerValid') });
      } else if (data.status === 'granted') {
        setState({ kind: 'granted', childName: data.childName });
      } else {
        setState({ kind: 'ready', childName: data.childName });
      }
    });
  }, [token]);

  const confirm = async () => {
    setConfirming(true);
    const { data, error } = await invokeFunction<{ childName: string }>('parental-consent', { action: 'confirm', token });
    setConfirming(false);
    if (error || !data) {
      setState({ kind: 'error', message: error || tr('parentalConsent.theConsentCouldNotBeSaved') });
      return;
    }
    setState({ kind: 'granted', childName: data.childName });
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">{tr('parentalConsent.parentalConsent')}</h1>
        </div>

        {state.kind === 'loading' && (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        )}

        {state.kind === 'error' && (
          <div className="flex gap-3 rounded-lg bg-destructive/10 p-4">
            <XCircle className="h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm">{state.message}</p>
          </div>
        )}

        {state.kind === 'ready' && (
          <>
            <p>
              <strong>{state.childName}</strong> {tr('parentalConsent.hasCreatedAnAccountOnYoung')}
            </p>
            <p>{tr('parentalConsent.byGivingYourConsentYouAllow')}</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>{tr('parentalConsent.anAdultCanOnlyMessageYour')}</li>
              <li>{tr('parentalConsent.yourChildCanBlockOrReport')}</li>
              <li>{tr('parentalConsent.youCanRequestTheDeletionOf')}</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              {tr('parentalConsent.beforeConfirmingReadThe')} <Link to="/legal/cgu" className="underline">{tr('auth.termsLink')}</Link> {tr('auth.and')} <Link to="/legal/confidentialite" className="underline">{tr('auth.privacyLink')}</Link>.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={confirm} disabled={confirming}>
                {confirming && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {tr('parentalConsent.iAmTheirParentAndI')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {tr('parentalConsent.doYouRefuseOrNotRecognise')} <Link to="/legal/mentions-legales" className="underline">{tr('parentalConsent.legalNotice')}</Link>.
            </p>
          </>
        )}

        {state.kind === 'granted' && (
          <div className="flex gap-3 rounded-lg bg-green-500/10 p-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
            <p className="text-sm">
              {tr('parentalConsent.thankYouTheConsentIsRecorded')} <strong>{state.childName}</strong> {tr('parentalConsent.isNowActive')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentalConsent;
