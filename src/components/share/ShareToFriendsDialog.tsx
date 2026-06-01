import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface Props {
  url: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  onShared?: () => void;
}

const ShareToFriendsDialog: React.FC<Props> = ({ url, title = '', description = '', children, onShared }) => {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMessage([title, description, url].filter(Boolean).join('\n'));
    loadFriends();
  }, [open]);

  const loadFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('connections')
      .select('user_id, connected_user_id')
      .eq('status', 'accepted')
      .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);
    const ids = (data || []).map(c => c.user_id === user.id ? c.connected_user_id : c.user_id);
    if (!ids.length) { setFriends([]); return; }
    const { data: profs } = await supabase.from('profiles').select('id, name, avatar_url').in('id', ids);
    setFriends((profs || []) as Friend[]);
  };

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const send = async () => {
    if (!selected.size) { toast.error('Sélectionnez au moins un ami'); return; }
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      for (const fid of selected) {
        const { data: convId, error: rpcErr } = await supabase.rpc('create_conversation_with_participant', { _other_user_id: fid });
        if (rpcErr) throw rpcErr;
        await supabase.from('messages').insert({ conversation_id: convId as string, sender_id: user.id, content: message });
      }
      toast.success(`Partagé avec ${selected.size} ami(s)`);
      onShared?.();
      setOpen(false);
      setSelected(new Set());
    } catch (e: any) {
      toast.error(e.message || 'Échec du partage');
    } finally {
      setSending(false);
    }
  };

  const filtered = friends.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Partager avec des amis</DialogTitle></DialogHeader>
        <Textarea value={message} onChange={e => setMessage(e.target.value)} className="min-h-[80px]" placeholder="Ajouter un message..." />
        <Input placeholder="Rechercher un ami..." value={search} onChange={e => setSearch(e.target.value)} />
        <ScrollArea className="h-64 border rounded-md">
          <div className="p-2 space-y-1">
            {filtered.length === 0 && <p className="text-sm text-muted-foreground p-2">Aucun ami trouvé</p>}
            {filtered.map(f => (
              <label key={f.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer">
                <Checkbox checked={selected.has(f.id)} onCheckedChange={() => toggle(f.id)} />
                <Avatar className="h-8 w-8"><AvatarImage src={f.avatar_url || undefined} /><AvatarFallback>{f.name?.[0] || '?'}</AvatarFallback></Avatar>
                <span className="text-sm">{f.name}</span>
              </label>
            ))}
          </div>
        </ScrollArea>
        <Button onClick={send} disabled={sending || !selected.size} className="w-full">
          <Send className="h-4 w-4 mr-2" /> Envoyer ({selected.size})
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ShareToFriendsDialog;
