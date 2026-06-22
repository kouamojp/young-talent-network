import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneMissed,
  Video, Search, Clock, Loader2, Star
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCall } from '@/contexts/CallContext';

interface Contact { id: string; name: string; avatar_url: string | null; user_type: string; country: string | null; }

interface CallRecord {
  id: string;
  type: 'incoming' | 'outgoing' | 'missed';
  isVideo: boolean;
  time: string;
  duration: string;
  peer: { id: string; name: string; avatar_url: string | null };
}

const fmtDuration = (s: number) => s > 0 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '';

const Calls: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { startCall } = useCall();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [history, setHistory] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }

      const { data: contactsData } = await supabase
        .from('profiles').select('id, name, avatar_url, user_type, country').neq('id', user.id).limit(20);
      const contactList = contactsData || [];
      setContacts(contactList);

      const { data: callsData } = await supabase
        .from('calls')
        .select('*')
        .or(`caller_id.eq.${user.id},callee_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      const calls = callsData || [];
      const peerIds = Array.from(new Set(calls.map(c => c.caller_id === user.id ? c.callee_id : c.caller_id)));
      const { data: peersData } = peerIds.length
        ? await supabase.from('profiles').select('id, name, avatar_url').in('id', peerIds)
        : { data: [] as any[] };
      const peers = new Map((peersData || []).map((p: any) => [p.id, p]));

      const records: CallRecord[] = calls.map((c) => {
        const outgoing = c.caller_id === user.id;
        const peerId = outgoing ? c.callee_id : c.caller_id;
        const missed = !outgoing && (c.status === 'missed' || c.status === 'cancelled' || c.status === 'rejected');
        return {
          id: c.id,
          type: missed ? 'missed' : outgoing ? 'outgoing' : 'incoming',
          isVideo: c.is_video,
          time: new Date(c.created_at).toLocaleString(),
          duration: fmtDuration(c.duration_seconds || 0),
          peer: peers.get(peerId) || { id: peerId, name: 'Utilisateur', avatar_url: null },
        };
      });
      setHistory(records);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const call = (peer: { id: string; name: string; avatar_url: string | null }, video: boolean) => startCall(peer, video);

  const stats = {
    total: history.length,
    received: history.filter(c => c.type === 'incoming').length,
    made: history.filter(c => c.type === 'outgoing').length,
    missed: history.filter(c => c.type === 'missed').length,
  };

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'incoming': return <PhoneIncoming className="h-4 w-4 text-green-500" />;
      case 'outgoing': return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
      case 'missed': return <PhoneMissed className="h-4 w-4 text-destructive" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="w-full min-h-screen">
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/15"><PhoneCall className="h-7 w-7" /></div>
            <div><h1 className="text-2xl font-bold">{t('calls.title')}</h1><p className="text-white/80 text-sm">{t('calls.subtitle')}</p></div>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { icon: Phone, label: t('calls.totalCalls'), value: stats.total },
              { icon: PhoneIncoming, label: t('calls.received'), value: stats.received },
              { icon: PhoneOutgoing, label: t('calls.made'), value: stats.made },
              { icon: PhoneMissed, label: t('calls.missed'), value: stats.missed },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <stat.icon className="h-5 w-5 mx-auto mb-1 text-white/80" /><div className="text-lg font-bold">{stat.value}</div><div className="text-xs text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-muted/50">
            <TabsTrigger value="history">{t('calls.history')}</TabsTrigger>
            <TabsTrigger value="contacts">{t('calls.contacts')}</TabsTrigger>
            <TabsTrigger value="favorites">{t('calls.favorites')}</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {history.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <PhoneCall className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p>{t('calls.noFavoritesDesc')}</p>
                  </div>
                )}
                {history.map((call) => (
                  <Card key={call.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Avatar className="h-12 w-12"><AvatarImage src={call.peer.avatar_url || ''} /><AvatarFallback>{call.peer.name?.[0] || '?'}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{call.peer.name}</p>
                          {call.isVideo && <Badge variant="secondary" className="text-[10px]">{t('calls.video')}</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">{getCallIcon(call.type)}<span>{call.time}</span>{call.duration && <span>• {call.duration}</span>}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-green-600 hover:bg-green-50" onClick={() => call.peer && startCall(call.peer, false)}><Phone className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50" onClick={() => call.peer && startCall(call.peer, true)}><Video className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div>
                <Card>
                  <CardHeader className="pb-3"><h3 className="font-semibold text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {t('calls.quickDial')}</h3></CardHeader>
                  <CardContent className="space-y-2">
                    {contacts.slice(0, 5).map((c) => (
                      <div key={c.id} onClick={() => call(c, false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <Avatar className="h-8 w-8"><AvatarImage src={c.avatar_url || ''} /><AvatarFallback className="text-xs">{c.name[0]}</AvatarFallback></Avatar>
                        <span className="text-sm font-medium flex-1 truncate">{c.name}</span><Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('calls.searchContact')} className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredContacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12"><AvatarImage src={contact.avatar_url || ''} /><AvatarFallback>{contact.name[0]}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{contact.name}</p>
                      <div className="flex items-center gap-1"><Badge variant="secondary" className="text-[10px]">{contact.user_type}</Badge>{contact.country && <span className="text-[10px] text-muted-foreground">{contact.country}</span>}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => call(contact, false)}><Phone className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => call(contact, true)}><Video className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t('calls.noFavorites')}</h3>
              <p className="text-muted-foreground text-sm">{t('calls.noFavoritesDesc')}</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Calls;
