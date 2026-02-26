import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadButtonProps {
  userId: string;
  folder: string;
  accept?: string;
  onUploaded: (url: string) => void;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'icon';
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  userId, folder, accept = 'image/*', onUploaded, label = 'Upload', variant = 'outline', size = 'sm'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 10MB)');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}/${folder}/${Date.now()}.${ext}`;
      
      const { error } = await supabase.storage
        .from('profile-files')
        .upload(path, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-files')
        .getPublicUrl(path);

      onUploaded(publicUrl);
      toast.success('Fichier uploadé');
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleUpload} />
      <Button variant={variant} size={size} onClick={() => inputRef.current?.click()} disabled={uploading} className="gap-1.5">
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {label}
      </Button>
    </>
  );
};

export default FileUploadButton;
