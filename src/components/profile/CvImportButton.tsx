import React, { useRef, useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { tr } from '@/i18n';
import { invokeFunction } from '@/lib/invokeFunction';
import { extractPdfText, normalizeExtracted, type ProfileImport } from '@/lib/profileImport';
import ProfileImportDialog from './ProfileImportDialog';

const MAX_SIZE = 5 * 1024 * 1024;

/**
 * "Import a CV": the PDF is read in the browser (it is never uploaded), its text
 * is analysed by the `parse-cv` function, then the member reviews what to keep.
 */
const CvImportButton: React.FC<{ userId: string; onApplied?: () => void }> = ({ userId, onApplied }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<'idle' | 'reading' | 'analysing'>('idle');
  const [proposal, setProposal] = useState<ProfileImport | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFile = async (file: File) => {
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    const isText = file.type === 'text/plain' || /\.txt$/i.test(file.name);
    if (!isPdf && !isText) { toast({ title: tr('profileImport.cvFormat'), variant: 'destructive' }); return; }
    if (file.size > MAX_SIZE) { toast({ title: tr('profileImport.cvTooLarge'), variant: 'destructive' }); return; }

    setFileName(file.name);
    try {
      setPhase('reading');
      const text = isPdf ? await extractPdfText(file) : await file.text();
      if (text.replace(/\s/g, '').length < 80) { toast({ title: tr('profileImport.cvNoText'), variant: 'destructive' }); return; }

      setPhase('analysing');
      const { data, error } = await invokeFunction<{ data: unknown }>('parse-cv', { text: text.slice(0, 20000), fileName: file.name });
      if (error || !data) { toast({ title: tr('profileImport.cvError'), description: error || undefined, variant: 'destructive' }); return; }
      setProposal(normalizeExtracted(data.data));
    } catch (e) {
      toast({ title: tr('profileImport.cvError'), description: (e as Error)?.message, variant: 'destructive' });
    } finally {
      setPhase('idle');
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const busy = phase !== 'idle';
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf,text/plain,.txt"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy} title={tr('profileImport.cvHint')}>
        {busy ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <FileUp className="h-3 w-3 mr-1" />}
        {phase === 'reading' ? tr('profileImport.cvReading') : phase === 'analysing' ? tr('profileImport.cvAnalysing') : tr('profileImport.importCv')}
      </Button>
      <ProfileImportDialog userId={userId} proposal={proposal} sourceLabel={fileName} onClose={() => setProposal(null)} onApplied={onApplied} />
    </>
  );
};

export default CvImportButton;
