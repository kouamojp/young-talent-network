import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneMissed, 
  Video, Search, Clock, Users, Loader2, Plus, Star
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  avatar_url: string | null;
  user_type: string;
  country: string | null;
}

const mockCallHistory = [
  { id: '1', type: 'outgoing' as const, duration: '5:32', time: 'Aujourd\'hui, 14:30', isVideo: false },
  { id: '2', type: 'incoming' as const, duration: '12:15', time: 'Aujourd\'hui, 11:00', isVideo: true },
  { id: '3', type: 'missed' as const, duration: '', time: 'Hier, 18:45', isVideo: false },
  { id: '4', type: 'outgoing' as const, duration: '3:10', time: 'Hier, 09:20', isVideo: true },
];

const Calls: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }

      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, user_type, country')
        .neq('id', user.id)
        .limit(20);

      setContacts(data || []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'incoming': return <PhoneIncoming className="h-4 w-4 text-green-500" />;
      case 'outgoing': return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
      case 'missed': return <PhoneMissed className="h-4 w-4 text-destructive" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/15">
              <PhoneCall className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">YAT Calls</h1>
              <p className="text-white/80 text-sm">Appels vocaux et vidéo avec votre réseau</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { icon: Phone, label: 'Total appels', value: mockCallHistory.length },
              { icon: PhoneIncoming, label: 'Reçus', value: 1 },
              { icon: PhoneOutgoing, label: 'Émis', value: 2 },
              { icon: PhoneMissed, label: 'Manqués', value: 1 },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <stat.icon className="h-5 w-5 mx-auto mb-1 text-white/80" />
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-muted/50">
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Nouvel appel
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Video className="h-4 w-4" /> Appel vidéo
                  </Button>
                </div>

                {mockCallHistory.map((call, idx) => {
                  const contact = contacts[idx % contacts.length];
                  return (
                    <Card key={call.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={contact?.avatar_url || ''} />
                          <AvatarFallback>{contact?.name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate">{contact?.name || 'Utilisateur'}</p>
                            {call.isVideo && <Badge variant="secondary" className="text-[10px]">Vidéo</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {getCallIcon(call.type)}
                            <span>{call.time}</span>
                            {call.duration && <span>• {call.duration}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-green-600 hover:bg-green-50">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50">
                            <Video className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick dial */}
              <div>
                <Card>
                  <CardHeader className="pb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" /> Appels rapides
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contacts.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={c.avatar_url || ''} />
                          <AvatarFallback className="text-xs">{c.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium flex-1 truncate">{c.name}</span>
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
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
              <Input 
                placeholder="Rechercher un contact..." 
                className="pl-10" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredContacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={contact.avatar_url || ''} />
                      <AvatarFallback>{contact.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{contact.name}</p>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-[10px]">{contact.user_type}</Badge>
                        {contact.country && <span className="text-[10px] text-muted-foreground">{contact.country}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Pas de favoris pour l'instant</h3>
              <p className="text-muted-foreground text-sm">Ajoutez des contacts en favoris pour les retrouver ici rapidement</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Calls;
