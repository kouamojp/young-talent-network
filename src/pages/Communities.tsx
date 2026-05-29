import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import GlassMorphism from '@/components/GlassMorphism';
import { Users, Globe, Settings, Plus, MessageSquare, Clock, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import ShareMenu from '@/components/share/ShareMenu';

interface Community {
  id: number;
  name: string;
  members: number;
  category: string;
  image: string;
  description: string;
  isJoined: boolean;
}

const initialCommunities: Community[] = [
  { id: 1, name: 'Music Producers Network', members: 1245, category: 'Music', image: '/placeholder.svg', description: 'A community for music producers to share tips, collaborate, and grow together.', isJoined: true },
  { id: 2, name: 'Young Actors Guild', members: 873, category: 'Acting', image: '/placeholder.svg', description: 'Support network for young actors pursuing their dreams in film, TV, and theater.', isJoined: false },
  { id: 3, name: 'Digital Art Collective', members: 621, category: 'Art & Design', image: '/placeholder.svg', description: 'A space for digital artists to showcase work, get feedback, and find opportunities.', isJoined: true },
  { id: 4, name: 'Writers Workshop', members: 435, category: 'Writing', image: '/placeholder.svg', description: 'For writers of all genres to workshop ideas, get feedback, and improve their craft.', isJoined: false },
];

const initialPosts = [
  { id: 1, author: { name: 'Jane Smith', avatar: '/placeholder.svg' }, community: 'Music Producers Network', content: 'Just released my new track "Ambient Dreams" - created entirely using analog synths. Would love your feedback!', time: '2 hours ago', likes: 24, comments: 8 },
  { id: 2, author: { name: 'Alex Chen', avatar: '/placeholder.svg' }, community: 'Digital Art Collective', content: 'Sharing my latest digital painting inspired by cyberpunk aesthetics. Created in Procreate using a custom brush set.', time: '5 hours ago', likes: 47, comments: 12 },
];

const Communities: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>(initialCommunities);
  const [posts] = useState(initialPosts);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const toggleJoin = (id: number) => {
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, isJoined: !c.isJoined, members: c.isJoined ? c.members - 1 : c.members + 1 }
          : c
      )
    );
    const c = communities.find((x) => x.id === id);
    toast({
      title: c?.isJoined ? 'Communauté quittée' : 'Bienvenue !',
      description: c?.isJoined ? `Vous avez quitté ${c?.name}` : `Vous avez rejoint ${c?.name}`,
    });
  };

  const createCommunity = () => {
    toast({ title: 'Bientôt disponible', description: 'La création de communauté sera bientôt disponible.' });
  };

  const viewCommunity = (c: Community) => {
    toast({ title: c.name, description: `Ouverture du fil de ${c.name}...` });
  };

  const openSettings = (c: Community) => {
    toast({ title: 'Paramètres', description: `Paramètres de ${c.name} à venir.` });
  };

  const toggleLike = (postId: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const openComments = (postId: number) => {
    toast({ title: 'Commentaires', description: 'Module de commentaires en cours d\'intégration.' });
  };

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
            <Button onClick={createCommunity}><Plus className="h-4 w-4 mr-2" />{t('communities.createCommunity')}</Button>
          </div>

          <Tabs defaultValue="discover">
            <TabsList className="mb-4">
              <TabsTrigger value="discover">{t('communities.discover')}</TabsTrigger>
              <TabsTrigger value="my-communities">{t('communities.myCommunities')}</TabsTrigger>
              <TabsTrigger value="recommended">{t('communities.recommended')}</TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communities.map(community => (
                  <GlassMorphism key={community.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                        <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{community.name}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{community.members} {t('communities.members')}</span>
                          <span className="mx-2">•</span>
                          <span>{community.category}</span>
                        </div>
                        <p className="text-sm mt-1 text-gray-600 line-clamp-2">{community.description}</p>
                        <Button
                          variant={community.isJoined ? "outline" : "default"}
                          size="sm"
                          className="mt-2"
                          onClick={() => toggleJoin(community.id)}
                        >
                          {community.isJoined ? t('communities.joined') : t('communities.join')}
                        </Button>
                      </div>
                    </div>
                  </GlassMorphism>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="my-communities">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communities.filter(c => c.isJoined).map(community => (
                  <GlassMorphism key={community.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                        <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{community.name}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{community.members} {t('communities.members')}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => viewCommunity(community)}>
                            <MessageSquare className="h-3 w-3 mr-1" />{t('communities.view')}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openSettings(community)}>
                            <Settings className="h-3 w-3 mr-1" />{t('communities.settings')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </GlassMorphism>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommended">
              <p>{t('communities.recommendedDesc')}</p>
            </TabsContent>
          </Tabs>
        </GlassMorphism>

        <GlassMorphism className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('communities.communityPosts')}</h2>
          <div className="space-y-4">
            {posts.map(post => {
              const liked = likedPosts.has(post.id);
              return (
                <GlassMorphism key={post.id} className="p-4">
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar><AvatarImage src={post.author.avatar} alt={post.author.name} /><AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback></Avatar>
                        <div>
                          <h4 className="font-medium">{post.author.name}</h4>
                          <div className="flex items-center text-xs text-gray-500">
                            <Globe className="h-3 w-3 mr-1" /><span>{post.community}</span><span className="mx-1">•</span><Clock className="h-3 w-3 mr-1" /><span>{post.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{post.content}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-500' : 'text-gray-600 hover:text-primary'}`}
                      >
                        <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} /> {post.likes + (liked ? 1 : 0)}
                      </button>
                      <button onClick={() => openComments(post.id)} className="flex items-center gap-1 text-gray-600 hover:text-primary">
                        <MessageSquare className="h-4 w-4" /> {post.comments}
                      </button>
                    </div>
                    <ShareMenu
                      url={`${window.location.origin}/communities#post-${post.id}`}
                      title={`${post.author.name} dans ${post.community}: ${post.content}`}
                    >
                      <button className="text-gray-600 hover:text-primary">{t('communities.share')}</button>
                    </ShareMenu>
                  </div>
                </GlassMorphism>
              );
            })}
          </div>
        </GlassMorphism>
      </main>
    </div>
  );
};

export default Communities;
