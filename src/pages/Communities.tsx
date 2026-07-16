import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import GlassMorphism from '@/components/GlassMorphism';
import { Users, Settings, Plus, MessageSquare, Lock, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Community {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  members_count: number | null;
  is_private: boolean | null;
  creator_id: string;
  isJoined: boolean;
}

const Communities: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const loadCommunities = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id ?? null);

    const [commRes, memRes] = await Promise.all([
      supabase.from('communities').select('*').order('members_count', { ascending: false }),
      user
        ? supabase.from('community_members').select('community_id').eq('user_id', user.id)
        : Promise.resolve({ data: [] as { community_id: string }[] }),
    ]);

    const joinedIds = new Set((memRes.data || []).map((m: { community_id: string }) => m.community_id));
    setCommunities(((commRes.data || []) as Omit<Community, 'isJoined'>[]).map((c) => ({
      ...c,
      isJoined: joinedIds.has(c.id),
    })));
    setLoading(false);
  };

  useEffect(() => { loadCommunities(); }, []);

  const toggleJoin = async (community: Community) => {
    if (!currentUserId) {
      toast({ title: 'Connexion requise', description: 'Connectez-vous pour rejoindre une communauté.', variant: 'destructive' });
      return;
    }
    setBusyId(community.id);
    const joining = !community.isJoined;
    try {
      if (joining) {
        const { error } = await supabase.from('community_members').insert({ community_id: community.id, user_id: currentUserId });
        if (error) throw error;
        await supabase.from('communities').update({ members_count: (community.members_count || 0) + 1 }).eq('id', community.id);
      } else {
        const { error } = await supabase.from('community_members').delete().eq('community_id', community.id).eq('user_id', currentUserId);
        if (error) throw error;
        await supabase.from('communities').update({ members_count: Math.max(0, (community.members_count || 1) - 1) }).eq('id', community.id);
      }
      setCommunities((prev) => prev.map((c) =>
        c.id === community.id
          ? { ...c, isJoined: joining, members_count: Math.max(0, (c.members_count || 0) + (joining ? 1 : -1)) }
          : c
      ));
      toast({
        title: joining ? 'Bienvenue !' : 'Communauté quittée',
        description: joining ? `Vous avez rejoint ${community.name}` : `Vous avez quitté ${community.name}`,
      });
    } catch (e) {
      toast({ title: 'Erreur', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const createCommunity = async () => {
    if (!currentUserId) {
      toast({ title: 'Connexion requise', description: 'Connectez-vous pour créer une communauté.', variant: 'destructive' });
      return;
    }
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('communities')
        .insert({ name: newName.trim(), description: newDesc.trim() || null, creator_id: currentUserId, members_count: 1 })
        .select('*')
        .single();
      if (error) throw error;
      await supabase.from('community_members').insert({ community_id: data.id, user_id: currentUserId, role: 'admin' });
      setCommunities((prev) => [{ ...(data as Omit<Community, 'isJoined'>), isJoined: true }, ...prev]);
      toast({ title: 'Communauté créée', description: `${data.name} est en ligne.` });
      setCreateOpen(false);
      setNewName('');
      setNewDesc('');
    } catch (e) {
      toast({ title: 'Erreur', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const CommunityCard = ({ community, compact = false }: { community: Community; compact?: boolean }) => (
    <GlassMorphism className="p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
          {community.image_url
            ? <img src={community.image_url} alt={community.name} className="w-full h-full object-cover" />
            : <Users className="h-7 w-7 text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{community.name}</h3>
            {community.is_private && <Lock className="h-3 w-3 text-gray-500 flex-shrink-0" />}
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Users className="h-3 w-3 mr-1" />
            <span>{community.members_count || 0} {t('communities.members')}</span>
          </div>
          {!compact && community.description && (
            <p className="text-sm mt-1 text-gray-600 line-clamp-2">{community.description}</p>
          )}
          {compact ? (
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => toast({ title: community.name, description: 'Fil de communauté à venir.' })}>
                <MessageSquare className="h-3 w-3 mr-1" />{t('communities.view')}
              </Button>
              {community.creator_id === currentUserId && (
                <Button size="sm" variant="outline" onClick={() => toast({ title: 'Paramètres', description: 'À venir.' })}>
                  <Settings className="h-3 w-3 mr-1" />{t('communities.settings')}
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant={community.isJoined ? 'outline' : 'default'}
              size="sm"
              className="mt-2"
              disabled={busyId === community.id}
              onClick={() => toggleJoin(community)}
            >
              {busyId === community.id
                ? <Loader2 className="h-3 w-3 animate-spin" />
                : (community.isJoined ? t('communities.joined') : t('communities.join'))}
            </Button>
          )}
        </div>
      </div>
    </GlassMorphism>
  );

  const joined = communities.filter((c) => c.isJoined);
  const notJoined = communities.filter((c) => !c.isJoined);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <GlassMorphism className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6" />
              <h1 className="text-2xl font-bold">{t('communities.title')}</h1>
            </div>
            <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('communities.createCommunity')}</Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Tabs defaultValue="discover">
              <TabsList className="mb-4">
                <TabsTrigger value="discover">{t('communities.discover')}</TabsTrigger>
                <TabsTrigger value="my-communities">{t('communities.myCommunities')}</TabsTrigger>
                <TabsTrigger value="recommended">{t('communities.recommended')}</TabsTrigger>
              </TabsList>

              <TabsContent value="discover" className="space-y-6">
                {communities.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p>Aucune communauté pour le moment. Créez la première !</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {communities.map((c) => <CommunityCard key={c.id} community={c} />)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="my-communities">
                {joined.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p>Vous n'avez rejoint aucune communauté.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {joined.map((c) => <CommunityCard key={c.id} community={c} compact />)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommended">
                {notJoined.length === 0 ? (
                  <p className="text-gray-500">{t('communities.recommendedDesc')}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notJoined.slice(0, 6).map((c) => <CommunityCard key={c.id} community={c} />)}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </GlassMorphism>
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('communities.createCommunity')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="community-name">Nom</Label>
              <Input id="community-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom de la communauté" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="community-desc">Description</Label>
              <Textarea id="community-desc" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="De quoi parle votre communauté ?" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button onClick={createCommunity} disabled={!newName.trim() || creating}>
              {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Communities;
