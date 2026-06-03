import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Plus, Trash2, ExternalLink, Instagram, Youtube, Music, Facebook, Twitter, Linkedin, Twitch } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

const PLATFORMS = [
  { v: 'instagram', l: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { v: 'youtube', l: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { v: 'tiktok', l: 'TikTok', icon: Music, color: 'text-foreground' },
  { v: 'facebook', l: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { v: 'twitter', l: 'Twitter / X', icon: Twitter, color: 'text-sky-500' },
  { v: 'linkedin', l: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  { v: 'twitch', l: 'Twitch', icon: Twitch, color: 'text-purple-500' },
  { v: 'vk', l: 'VK', icon: Globe, color: 'text-blue-500' },
  { v: 'telegram', l: 'Telegram', icon: Globe, color: 'text-sky-500' },
  { v: 'other', l: 'Autre', icon: Globe, color: 'text-muted-foreground' },
];

const getPlatformMeta = (p: string) => PLATFORMS.find(x => x.v === p) || PLATFORMS[PLATFORMS.length - 1];

interface Props { userId: string }

const MySocialLinksCard: React.FC<Props> = ({ userId }) => {
  const navigate = useNavigate();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [platform, setPlatform] = useState('instagram');
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('talent_social_links').select('*').eq('user_id', userId);
    if (data) setLinks(data as SocialLink[]);
  };
  useEffect(() => { load(); }, [userId]);

  const add = async () => {
    if (!url.trim()) { toast.error('URL requise'); return; }
    setSaving(true);
    const { data, error } = await supabase.from('talent_social_links')
      .insert({ user_id: userId, platform, url: url.trim() })
      .select().single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    if (data) setLinks(l => [...l, data as SocialLink]);
    setUrl('');
    toast.success('Lien ajouté');
  };

  const remove = async (id: string) => {
    await supabase.from('talent_social_links').delete().eq('id', id);
    setLinks(l => l.filter(x => x.id !== id));
    toast.success('Supprimé');
  };

  const openInYatSocial = (link: SocialLink) => {
    navigate(`/social?url=${encodeURIComponent(link.url)}&platform=${encodeURIComponent(link.platform)}`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" /> Mes réseaux sociaux
          <Badge variant="secondary" className="ml-1">{links.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PLATFORMS.map(p => <SelectItem key={p.v} value={p.v}>{p.l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            placeholder="https://..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            className="flex-1"
          />
          <Button onClick={add} disabled={saving} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Ajouter
          </Button>
        </div>

        {links.length > 0 ? (
          <div className="space-y-2">
            {links.map(link => {
              const meta = getPlatformMeta(link.platform);
              const Icon = meta.icon;
              return (
                <div key={link.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <button
                    type="button"
                    onClick={() => openInYatSocial(link)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    title="Ouvrir dans YAT Social"
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${meta.color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{meta.l}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </button>
                  <Button size="icon" variant="ghost" onClick={() => remove(link.id)} className="h-7 w-7 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Aucun lien. Ajoutez vos réseaux pour les retrouver dans YAT Social.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MySocialLinksCard;
