import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { invokeFunction } from '@/lib/invokeFunction';

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
    if (!token) { setState({ kind: 'error', message: 'Lien incomplet. Utilisez le lien reçu par e-mail.' }); return; }
    invokeFunction<{ childName: string; status: string }>('parental-consent', { action: 'info', token }).then(({ data, error }) => {
      if (error || !data) {
        setState({ kind: 'error', message: error || "Ce lien n'est plus valable." });
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
      setState({ kind: 'error', message: error || "L'accord n'a pas pu être enregistré. Réessayez." });
      return;
    }
    setState({ kind: 'granted', childName: data.childName });
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Accord parental</h1>
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
              <strong>{state.childName}</strong> a créé un compte sur Young &amp; Talented (YAT), une plateforme où les jeunes
              présentent leurs talents et échangent avec d'autres membres, des agents et des organisations.
            </p>
            <p>En donnant votre accord, vous permettez à votre enfant d'utiliser toutes les fonctions de YAT, y compris la messagerie. Pour sa sécurité :</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>un adulte ne peut lui écrire que si votre enfant a accepté sa demande d'ami ;</li>
              <li>votre enfant peut bloquer ou signaler n'importe quel membre ;</li>
              <li>vous pouvez demander la suppression du compte à tout moment.</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Avant de confirmer, consultez les <Link to="/legal/cgu" className="underline">conditions d'utilisation</Link> et
              la <Link to="/legal/confidentialite" className="underline">politique de confidentialité</Link>.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={confirm} disabled={confirming}>
                {confirming && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Je suis son parent et je donne mon accord
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Vous refusez ou ne connaissez pas ce compte ? Ne faites rien : la messagerie restera désactivée.
              Pour demander sa suppression, écrivez à l'adresse indiquée dans les <Link to="/legal/mentions-legales" className="underline">mentions légales</Link>.
            </p>
          </>
        )}

        {state.kind === 'granted' && (
          <div className="flex gap-3 rounded-lg bg-green-500/10 p-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
            <p className="text-sm">
              Merci. L'accord est enregistré : le compte de <strong>{state.childName}</strong> est maintenant actif.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentalConsent;
