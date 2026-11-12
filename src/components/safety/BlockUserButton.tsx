import React, { useState } from 'react';
import { Ban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBlocks } from '@/hooks/useBlocks';
import { tr } from '@/i18n';

interface BlockUserButtonProps {
  userId: string;
  name?: string;
  size?: 'sm' | 'default';
  onChange?: (blocked: boolean) => void;
}

/** « Bloquer / Débloquer » avec confirmation. Ne s'affiche pas sur son propre profil ni hors connexion. */
const BlockUserButton: React.FC<BlockUserButtonProps> = ({ userId, name, size = 'sm', onChange }) => {
  const { userId: me, isBlocked, block, unblock, loading } = useBlocks();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!me || me === userId || loading) return null;
  const blocked = isBlocked(userId);

  const run = async () => {
    setBusy(true);
    const ok = blocked ? await unblock(userId, name) : await block(userId, name);
    setBusy(false);
    setConfirmOpen(false);
    if (ok) onChange?.(!blocked);
  };

  return (
    <>
      <Button
        variant="outline"
        size={size}
        className={blocked ? 'gap-2' : 'gap-2 text-destructive hover:text-destructive'}
        onClick={() => (blocked ? run() : setConfirmOpen(true))}
        disabled={busy}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
        {blocked ? tr('common.unblock') : tr('common.block')}
      </Button>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr('common.block')} {name || tr('blockUserButton.thisMember')} ?</AlertDialogTitle>
            <AlertDialogDescription>
              {tr('blockUserButton.youWillNoLongerBeAble')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>{tr('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={busy}
              onClick={(e) => { e.preventDefault(); run(); }}
            >
              {tr('common.block')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BlockUserButton;
