import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import SocialSidebar from '@/components/SocialSidebar';
import GlassMorphism from '@/components/GlassMorphism';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Volume2, VolumeX, Calendar, Clock, Heart, Share2, Tv, Radio, Video, Star, Link, Plus, Users, Trash2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import ShareToFriendsDialog from '@/components/share/ShareToFriendsDialog';

const OnlineTV: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('live');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [tvLink, setTvLink] = useState('');
  const [tvTitle, setTvTitle] = useState('');
  const [tvDescription, setTvDescription] = useState('');
  const [addedLinks, setAddedLinks] = useState<{ url: string; title: string; description: string }[]>([]);

  const handleAddLink = () => {
    if (!tvLink.trim()) return;
    try {
      new URL(tvLink);
      setAddedLinks(prev => [...prev, { url: tvLink.trim(), title: tvTitle.trim() || tvLink.trim(), description: tvDescription.trim() }]);
      setTvLink('');
      setTvTitle('');
      setTvDescription('');
      toast.success(t('tv.linkAdded'));
    } catch {
      toast.error(t('tv.invalidLink'));
    }
  };

  const removeLink = (i: number) => setAddedLinks(prev => prev.filter((_, idx) => idx !== i));

  const liveStreams = [
    { id: 1, title: "Young Musicians Concert", channel: "Y&T Music", thumbnail: "https://images.unsplash.com/photo-1541804627596-3b5b9ef58c93", viewers: 1245, category: "Music" },
    { id: 2, title: "Dance Workshop with Maria", channel: "Dance Academy", thumbnail: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff", viewers: 856, category: "Dance" },
    { id: 3, title: "Young Artist Masterclass", channel: "Art & Design", thumbnail: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b", viewers: 567, category: "Art" },
  ];

  const scheduledStreams = [
    { id: 1, title: "Talent Scout Live Q&A", channel: "Y&T Official", thumbnail: "https://images.unsplash.com/photo-1560439514-4e9645039924", date: "Tomorrow", time: "7:00 PM", category: "Career" },
    { id: 2, title: "Photography Tips for Portfolios", channel: "Visual Media", thumbnail: "https://images.unsplash.com/photo-1554080353-a576cf803bda", date: "Wed, Jun 15", time: "5:30 PM", category: "Photography" },
    { id: 3, title: "Acting Workshop: Monologues", channel: "Theatre Arts", thumbnail: "https://images.unsplash.com/photo-1522156373667-4c7234bbd804", date: "Fri, Jun 17", time: "6:00 PM", category: "Acting" },
  ];

  const recordings = [
    { id: 1, title: "Y&T Annual Awards 2023", channel: "Y&T Official", thumbnail: "https://images.unsplash.com/photo-1469571486292-b53926c9bf6c", views: "24K", posted: "2 weeks ago", category: "Events" },
    { id: 2, title: "How I Got My First Big Break", channel: "Success Stories", thumbnail: "https://images.unsplash.com/photo-1531058020387-3be344556be6", views: "15K", posted: "1 month ago", category: "Career" },
    { id: 3, title: "Behind the Scenes: Music Video Production", channel: "Y&T Media", thumbnail: "https://images.unsplash.com/photo-1574022341093-8950b0635882", views: "8.7K", posted: "2 months ago", category: "Music" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <GlassMorphism className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Tv className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{t('tv.title')}</h1>
          </div>

          <div className="mb-6">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black mb-4">
              <img src="https://images.unsplash.com/photo-1541804627596-3b5b9ef58c93" alt="Young Musicians Concert" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{t('tv.liveLabel')}: Young Musicians Concert</h2>
                <Button size="lg" variant="outline" onClick={() => setIsPlaying(!isPlaying)} className="rounded-full bg-white/20 border-white">
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-between items-center text-white">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}</Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsMuted(!isMuted)}>{isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</Button>
                    <span className="text-sm">{t('tv.liveLabel')} • 1.2K {t('tv.watching')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => toast('Ajouté à vos favoris ❤️')}><Heart className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); toast('Lien copié'); } catch {} }}><Share2 className="h-5 w-5" /></Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div><h3 className="text-xl font-bold">Young Musicians Concert</h3><p className="text-gray-600">Y&T Music • {t('tv.liveLabel')}</p></div>
              <Button onClick={() => toast('Abonné à Y&T Music')}>{t('tv.subscribe')}</Button>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="live" className="flex items-center gap-2"><Radio className="h-4 w-4" />{t('tv.liveNow')}</TabsTrigger>
              <TabsTrigger value="scheduled" className="flex items-center gap-2"><Calendar className="h-4 w-4" />{t('tv.comingUp')}</TabsTrigger>
              <TabsTrigger value="recordings" className="flex items-center gap-2"><Video className="h-4 w-4" />{t('tv.recordings')}</TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveStreams.map(stream => (
                  <div key={stream.id} className="bg-white/40 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedVideo(stream.id)}>
                    <div className="relative">
                      <img src={stream.thumbnail} alt={stream.title} className="w-full aspect-video object-cover" />
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">{t('tv.liveLabel')}</div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">{stream.viewers.toLocaleString()} {t('tv.watching')}</div>
                    </div>
                    <div className="p-3"><h3 className="font-semibold truncate">{stream.title}</h3><p className="text-sm text-gray-600">{stream.channel}</p><span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full mt-2 inline-block">{stream.category}</span></div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduledStreams.map(stream => (
                  <div key={stream.id} className="bg-white/40 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img src={stream.thumbnail} alt={stream.title} className="w-full aspect-video object-cover" />
                      <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">{t('tv.upcoming')}</div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold truncate">{stream.title}</h3>
                      <p className="text-sm text-gray-600">{stream.channel}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-600"><Calendar className="h-3 w-3" /><span>{stream.date}</span></div>
                        <div className="flex items-center gap-1 text-xs text-gray-600"><Clock className="h-3 w-3" /><span>{stream.time}</span></div>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full mt-2 inline-block">{stream.category}</span>
                      <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => toast('Rappel programmé 🔔')}>{t('tv.setReminder')}</Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recordings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recordings.map(recording => (
                  <div key={recording.id} className="bg-white/40 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedVideo(recording.id)}>
                    <div className="relative">
                      <img src={recording.thumbnail} alt={recording.title} className="w-full aspect-video object-cover" />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">{recording.views} {t('tv.views')}</div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold truncate">{recording.title}</h3>
                      <p className="text-sm text-gray-600">{recording.channel}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{recording.posted}</span>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4].map(i => <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />)}
                          <Star className="h-3 w-3 text-gray-300" />
                        </div>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full mt-2 inline-block">{recording.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </GlassMorphism>

        <GlassMorphism className="p-6">
          <h2 className="text-xl font-bold mb-4">{t('tv.featuredCreators')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white/40 rounded-lg overflow-hidden p-4 text-center">
                <div className="mx-auto w-20 h-20 rounded-full overflow-hidden mb-3"><img src="/placeholder.svg" alt="Creator" className="w-full h-full object-cover" /></div>
                <h3 className="font-semibold">Creator Name</h3>
                <p className="text-xs text-gray-600 mb-2">Music Producer</p>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full mb-3 inline-block">12K {t('tv.followers')}</span>
                <Button size="sm" className="w-full" onClick={() => toast('Vous suivez ce créateur')}>{t('tv.follow')}</Button>
              </div>
            ))}
          </div>
        </GlassMorphism>

        {/* Add TV Stream Link */}
        <GlassMorphism className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Link className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">{t('tv.addStreamLink')}</h2>
          </div>
          <div className="space-y-2">
            <Input
              value={tvTitle}
              onChange={e => setTvTitle(e.target.value)}
              placeholder="Titre du flux (optionnel)"
            />
            <Input
              value={tvLink}
              onChange={e => setTvLink(e.target.value)}
              placeholder={t('tv.streamLinkPlaceholder')}
              onKeyDown={e => e.key === 'Enter' && handleAddLink()}
            />
            <Textarea
              value={tvDescription}
              onChange={e => setTvDescription(e.target.value)}
              placeholder="Description (optionnel)"
              className="min-h-[70px]"
            />
            <Button onClick={handleAddLink} className="gap-1.5 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              {t('tv.addLink')}
            </Button>
          </div>

          {addedLinks.length > 0 && (
            <div className="mt-4 space-y-2">
              {addedLinks.map((link, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/40 rounded-lg p-3">
                  <Tv className="h-4 w-4 text-primary shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{link.title}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">
                      {link.url}
                    </a>
                    {link.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{link.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <ShareToFriendsDialog url={link.url} title={link.title} description={link.description}>
                      <Button size="sm" variant="outline" className="gap-1"><Users className="h-3 w-3" />Amis</Button>
                    </ShareToFriendsDialog>
                    <Button size="icon" variant="ghost" onClick={() => removeLink(i)} aria-label="Supprimer">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassMorphism>
      </main>
    </div>
  );
};

export default OnlineTV;
