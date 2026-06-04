import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Briefcase, MapPin, Calendar, DollarSign, Plus, Send, Bookmark, BookmarkCheck, Loader2, Inbox, Users, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { countries } from '@/data/countries';

const REQUEST_TYPES = [
  { key: 'recruitment', label: 'Recrutement', icon: '💼' },
  { key: 'collaboration', label: 'Collaboration', icon: '🤝' },
  { key: 'sponsoring', label: 'Sponsoring', icon: '💰' },
  { key: 'training', label: 'Formation', icon: '🎓' },
  { key: 'event', label: 'Événement', icon: '🎉' },
  { key: 'freelance', label: 'Mission freelance', icon: '⚡' },
  { key: 'sport_trial', label: 'Essai sportif', icon: '⚽' },
  { key: 'casting', label: 'Casting artistique', icon: '🎬' },
];

const typeMeta = (k: string) => REQUEST_TYPES.find(t => t.key === k) || { label: k, icon: '📌' };

const TalentMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState('browse');
  const [requests, setRequests] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [search, setSearch] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<any>({
    request_type: 'recruitment', title: '', description: '', domain: '',
    country: '', city: '', budget: '', deadline: '', conditions: '', contact: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const [applyOpen, setApplyOpen] = useState<any>(null);
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
      load(data.user?.id || null);
    });
  }, []);

  const load = async (uid: string | null) => {
    setLoading(true);
    const { data: reqs } = await supabase
      .from('talent_requests')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(60);

    const posterIds = [...new Set((reqs || []).map((r: any) => r.user_id))];
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, user_type')
      .in('id', posterIds);

    const enriched = (reqs || []).map((r: any) => ({
      ...r,
      poster: profs?.find((p: any) => p.id === r.user_id),
    }));
    setRequests(enriched);

    if (uid) {
      const [{ data: mine }, { data: apps }, { data: sv }] = await Promise.all([
        supabase.from('talent_requests').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('talent_request_applications').select('*, talent_requests(*)').eq('applicant_id', uid).order('created_at', { ascending: false }),
        supabase.from('saved_profiles').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      ]);
      setMyRequests(mine || []);
      setMyApplications(apps || []);

      if (sv && sv.length) {
        const ids = sv.map((s: any) => s.saved_user_id);
        const { data: sprofs } = await supabase.from('profiles').select('id, name, avatar_url, country, city, sport_type, user_type').in('id', ids);
        setSaved(sv.map((s: any) => ({ ...s, profile: sprofs?.find((p: any) => p.id === s.saved_user_id) })));
      } else setSaved([]);
    }
    setLoading(false);
  };

  const submitRequest = async () => {
    if (!userId) { navigate('/auth'); return; }
    if (!form.title || !form.description) { toast.error('Titre et description requis'); return; }
    setSubmitting(true);
    const payload = {
      ...form,
      user_id: userId,
      deadline: form.deadline || null,
      status: 'open',
    };
    const { error } = await supabase.from('talent_requests').insert(payload);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Demande publiée !');
    setCreateOpen(false);
    setForm({ request_type: 'recruitment', title: '', description: '', domain: '', country: '', city: '', budget: '', deadline: '', conditions: '', contact: '' });
    load(userId);
  };

  const apply = async () => {
    if (!userId || !applyOpen) { navigate('/auth'); return; }
    const { error } = await supabase.from('talent_request_applications').insert({
      request_id: applyOpen.id,
      applicant_id: userId,
      message: applyMessage,
    });
    if (error) {
      if (error.code === '23505') toast.error('Tu as déjà postulé');
      else toast.error(error.message);
      return;
    }
    toast.success('Candidature envoyée !');
    setApplyOpen(null); setApplyMessage('');
    load(userId);
  };

  const toggleSave = async (savedUserId: string) => {
    if (!userId) { navigate('/auth'); return; }
    const existing = saved.find(s => s.saved_user_id === savedUserId);
    if (existing) {
      await supabase.from('saved_profiles').delete().eq('id', existing.id);
      toast.success('Retiré des favoris');
    } else {
      await supabase.from('saved_profiles').insert({ user_id: userId, saved_user_id: savedUserId });
      toast.success('Profil sauvegardé');
    }
    load(userId);
  };

  const filtered = requests.filter(r => {
    if (filterType !== 'all' && r.request_type !== filterType) return false;
    if (filterCountry !== 'all' && r.country !== filterCountry) return false;
    if (search && !`${r.title} ${r.description} ${r.domain}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const RequestCard = ({ r, own }: any) => {
    const meta = typeMeta(r.request_type);
    return (
      <Card className="hover:shadow-md transition">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{meta.icon}</span>
              <Badge variant="secondary">{meta.label}</Badge>
            </div>
            {r.budget && (
              <Badge className="bg-emerald-100 text-emerald-700"><DollarSign className="h-3 w-3 mr-1" />{r.budget}</Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg mb-1">{r.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{r.description}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
            {r.domain && <Badge variant="outline">{r.domain}</Badge>}
            {(r.city || r.country) && (
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[r.city, r.country].filter(Boolean).join(', ')}</span>
            )}
            {r.deadline && (
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(r.deadline).toLocaleDateString()}</span>
            )}
          </div>
          {r.poster && (
            <div className="flex items-center gap-2 text-xs mb-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={r.poster.avatar_url} />
                <AvatarFallback>{r.poster.name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground">par {r.poster.name}</span>
            </div>
          )}
          {!own && (
            <Button size="sm" className="w-full" onClick={() => { setApplyOpen(r); setApplyMessage(''); }}>
              <Send className="h-3 w-3 mr-1" /> Envoyer une proposition
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-primary" />
            YAT Marketplace de Talents
          </h1>
          <p className="text-muted-foreground mt-1">Annonces, candidatures et talents sauvegardés</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Publier une demande</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nouvelle demande de talent</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type *</Label>
                  <Select value={form.request_type} onValueChange={(v) => setForm({ ...form, request_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REQUEST_TYPES.map(t => <SelectItem key={t.key} value={t.key}>{t.icon} {t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Domaine</Label>
                  <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="Ex: Football, Design..." />
                </div>
              </div>
              <div>
                <Label>Titre *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} maxLength={3000} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Pays</Label>
                  <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {countries.map((c: any) => <SelectItem key={c.code || c.name} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ville</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <Label>Budget / Rémunération</Label>
                  <Input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Ex: 500€/jour" />
                </div>
                <div>
                  <Label>Date limite</Label>
                  <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Conditions</Label>
                <Textarea value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Contact</Label>
                <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Email, téléphone, lien..." />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submitRequest} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Publier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="browse"><Search className="h-4 w-4 mr-1" />Explorer</TabsTrigger>
          <TabsTrigger value="mine"><Inbox className="h-4 w-4 mr-1" />Mes annonces</TabsTrigger>
          <TabsTrigger value="applications"><Send className="h-4 w-4 mr-1" />Mes candidatures</TabsTrigger>
          <TabsTrigger value="saved"><Bookmark className="h-4 w-4 mr-1" />Profils sauvegardés</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <Card className="mb-4">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  {REQUEST_TYPES.map(t => <SelectItem key={t.key} value={t.key}>{t.icon} {t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">Tous pays</SelectItem>
                  {countries.map((c: any) => <SelectItem key={c.code || c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto my-12" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(r => <RequestCard key={r.id} r={r} />)}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Aucune annonce ne correspond à tes filtres.</div>
          )}
        </TabsContent>

        <TabsContent value="mine">
          {myRequests.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-muted-foreground">Tu n'as pas encore publié d'annonce.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRequests.map(r => <RequestCard key={r.id} r={r} own />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications">
          {myApplications.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-muted-foreground">Tu n'as pas encore postulé.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {myApplications.map(a => (
                <Card key={a.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{a.talent_requests?.title}</div>
                        <div className="text-xs text-muted-foreground">{typeMeta(a.talent_requests?.request_type).label}</div>
                      </div>
                      <Badge>{a.status}</Badge>
                    </div>
                    {a.message && <p className="text-sm mt-2 p-2 bg-muted rounded">{a.message}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved">
          {saved.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-muted-foreground">Aucun profil sauvegardé.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {saved.map(s => s.profile && (
                <Card key={s.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar><AvatarImage src={s.profile.avatar_url} /><AvatarFallback>{s.profile.name?.[0]}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{s.profile.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.profile.sport_type} · {s.profile.city}</div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => toggleSave(s.saved_user_id)}>
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!applyOpen} onOpenChange={(o) => !o && setApplyOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Postuler — {applyOpen?.title}</DialogTitle></DialogHeader>
          <Textarea
            placeholder="Présente-toi et explique pourquoi tu es pertinent..."
            value={applyMessage}
            onChange={(e) => setApplyMessage(e.target.value)}
            rows={6}
            maxLength={2000}
          />
          <DialogFooter>
            <Button onClick={apply}><Send className="h-4 w-4 mr-2" />Envoyer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TalentMarketplace;
