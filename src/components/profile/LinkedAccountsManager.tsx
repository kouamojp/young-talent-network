import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Link2, Loader2, RefreshCw, Trash2, UserPlus, Check, X } from 'lucide-react';

type Status = 'pending' | 'accepted' | 'rejected';
interface LinkRow {
  id: string;
  owner_user_id: string;
  linked_user_id: string;
  status: Status;
  sync_fields: string[];
  last_synced_at: string | null;
}
interface ProfileLite { id: string; name: string; email: string; avatar_url: string | null; user_type: string }

const ALL_FIELDS = [
  { key: 'name', label: 'Имя' },
  { key: 'avatar_url', label: 'Аватар' },
  { key: 'bio', label: 'Био' },
  { key: 'city', label: 'Город' },
  { key: 'country', label: 'Страна' },
  { key: 'phone', label: 'Телефон' },
  { key: 'website', label: 'Сайт' },
  { key: 'cover_photo_url', label: 'Обложка' },
  { key: 'sport_type', label: 'Спорт' },
];

export const LinkedAccountsManager: React.FC = () => {
  const [me, setMe] = useState<string | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProfileLite[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setMe(user.id);
    const { data } = await supabase.from('account_links')
      .select('*')
      .or(`owner_user_id.eq.${user.id},linked_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    const rows = (data as LinkRow[]) || [];
    setLinks(rows);
    const ids = Array.from(new Set(rows.flatMap(r => [r.owner_user_id, r.linked_user_id])));
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles')
        .select('id, name, email, avatar_url, user_type').in('id', ids);
      const map: Record<string, ProfileLite> = {};
      (profs || []).forEach((p: any) => { map[p.id] = p; });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async () => {
    if (!query.trim() || !me) return;
    setSearching(true);
    const { data } = await supabase.from('profiles')
      .select('id, name, email, avatar_url, user_type')
      .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
      .neq('id', me).limit(8);
    setSearchResults((data as ProfileLite[]) || []);
    setSearching(false);
  };

  const ownedLinks = links.filter(l => l.owner_user_id === me);
  const incomingLinks = links.filter(l => l.linked_user_id === me);

  const handleInvite = async (linkedId: string) => {
    if (!me) return;
    if (ownedLinks.length >= 3) {
      toast({ title: 'Лимит', description: 'Максимум 3 связанных аккаунта', variant: 'destructive' });
      return;
    }
    setBusyId(linkedId);
    const { error } = await supabase.from('account_links').insert({
      owner_user_id: me, linked_user_id: linkedId, status: 'pending',
    });
    setBusyId(null);
    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Приглашение отправлено' });
    setSearchResults([]); setQuery('');
    load();
  };

  const handleRespond = async (id: string, status: Status) => {
    setBusyId(id);
    const { error } = await supabase.from('account_links').update({ status }).eq('id', id);
    setBusyId(null);
    if (error) { toast({ title: 'Ошибка', description: error.message, variant: 'destructive' }); return; }
    toast({ title: status === 'accepted' ? 'Связь принята' : 'Отклонено' });
    load();
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Удалить связь?')) return;
    setBusyId(id);
    const { error } = await supabase.from('account_links').delete().eq('id', id);
    setBusyId(null);
    if (error) { toast({ title: 'Ошибка', description: error.message, variant: 'destructive' }); return; }
    load();
  };

  const handleToggleField = async (link: LinkRow, field: string) => {
    const next = link.sync_fields.includes(field)
      ? link.sync_fields.filter(f => f !== field)
      : [...link.sync_fields, field];
    const { error } = await supabase.from('account_links').update({ sync_fields: next }).eq('id', link.id);
    if (error) { toast({ title: 'Ошибка', description: error.message, variant: 'destructive' }); return; }
    setLinks(prev => prev.map(l => l.id === link.id ? { ...l, sync_fields: next } : l));
  };

  const handleSyncNow = async (id: string) => {
    setBusyId(id);
    const { error } = await supabase.rpc('sync_linked_account', { _link_id: id });
    setBusyId(null);
    if (error) { toast({ title: 'Ошибка синхронизации', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Синхронизировано' });
    load();
    window.dispatchEvent(new CustomEvent('profile-updated'));
  };

  if (loading) {
    return <div className="flex justify-center p-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" /> Связанные аккаунты
          <Badge variant="outline" className="ml-2 text-xs">{ownedLinks.length}/3</Badge>
        </CardTitle>
        <CardDescription>
          Свяжите до 3 аккаунтов и синхронизируйте выбранные поля профиля между ними.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Add new */}
        {ownedLinks.length < 3 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1.5"><UserPlus className="h-4 w-4" /> Найти аккаунт</p>
            <div className="flex gap-2">
              <Input placeholder="Email или имя" value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              <Button onClick={handleSearch} disabled={searching || !query.trim()}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Найти'}
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-1 border rounded-md p-2">
                {searchResults.map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-2 p-1.5 hover:bg-muted/50 rounded">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-8 w-8"><AvatarImage src={p.avatar_url || ''} /><AvatarFallback>{p.name?.[0] || '?'}</AvatarFallback></Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleInvite(p.id)} disabled={busyId === p.id}>
                      Пригласить
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Incoming */}
        {incomingLinks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Входящие приглашения</p>
            {incomingLinks.filter(l => l.status === 'pending').map(l => {
              const p = profiles[l.owner_user_id];
              return (
                <div key={l.id} className="flex items-center justify-between gap-2 border rounded-md p-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-8 w-8"><AvatarImage src={p?.avatar_url || ''} /><AvatarFallback>{p?.name?.[0] || '?'}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p?.name || l.owner_user_id}</p>
                      <p className="text-xs text-muted-foreground">хочет синхронизироваться с вами</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="default" onClick={() => handleRespond(l.id, 'accepted')} disabled={busyId === l.id}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRespond(l.id, 'rejected')} disabled={busyId === l.id}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Owned */}
        <div className="space-y-3">
          {ownedLinks.length === 0 && incomingLinks.length === 0 && (
            <p className="text-sm text-muted-foreground">Пока нет связанных аккаунтов.</p>
          )}
          {ownedLinks.map(l => {
            const p = profiles[l.linked_user_id];
            return (
              <div key={l.id} className="border rounded-md p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-9 w-9"><AvatarImage src={p?.avatar_url || ''} /><AvatarFallback>{p?.name?.[0] || '?'}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p?.name || l.linked_user_id}</p>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={l.status === 'accepted' ? 'default' : l.status === 'pending' ? 'secondary' : 'outline'} className="text-[10px]">
                          {l.status === 'pending' ? 'ожидание' : l.status === 'accepted' ? 'принят' : 'отклонён'}
                        </Badge>
                        {p?.user_type && <Badge variant="outline" className="text-[10px]">{p.user_type}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {l.status === 'accepted' && (
                      <Button size="sm" variant="outline" onClick={() => handleSyncNow(l.id)} disabled={busyId === l.id} className="gap-1">
                        {busyId === l.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        Синхр.
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleRemove(l.id)} disabled={busyId === l.id}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
                {l.status === 'accepted' && (
                  <>
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                      {ALL_FIELDS.map(f => (
                        <label key={f.key} className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <Checkbox checked={l.sync_fields.includes(f.key)} onCheckedChange={() => handleToggleField(l, f.key)} />
                          {f.label}
                        </label>
                      ))}
                    </div>
                    {l.last_synced_at && (
                      <p className="text-[11px] text-muted-foreground">Последняя синхронизация: {new Date(l.last_synced_at).toLocaleString()}</p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkedAccountsManager;
