import React, { useState } from 'react';
import { Globe, Plus, X, ExternalLink, Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SocialTab {
  id: string;
  platform: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

const platformOptions = [
  { value: 'facebook', label: 'Facebook', icon: <Facebook className="h-4 w-4" />, color: 'text-blue-600', baseUrl: 'https://facebook.com/' },
  { value: 'instagram', label: 'Instagram', icon: <Instagram className="h-4 w-4" />, color: 'text-pink-500', baseUrl: 'https://instagram.com/' },
  { value: 'twitter', label: 'X (Twitter)', icon: <Twitter className="h-4 w-4" />, color: 'text-foreground', baseUrl: 'https://x.com/' },
  { value: 'youtube', label: 'YouTube', icon: <Youtube className="h-4 w-4" />, color: 'text-red-600', baseUrl: 'https://youtube.com/' },
  { value: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="h-4 w-4" />, color: 'text-blue-700', baseUrl: 'https://linkedin.com/' },
  { value: 'tiktok', label: 'TikTok', icon: <Globe className="h-4 w-4" />, color: 'text-foreground', baseUrl: 'https://tiktok.com/' },
  { value: 'other', label: 'Other', icon: <Globe className="h-4 w-4" />, color: 'text-muted-foreground', baseUrl: '' },
];

const Social: React.FC = () => {
  const [tabs, setTabs] = useState<SocialTab[]>([
    { id: '1', platform: 'facebook', url: 'https://facebook.com', icon: <Facebook className="h-4 w-4" />, color: 'text-blue-600' },
  ]);
  const [activeTab, setActiveTab] = useState('1');
  const [addOpen, setAddOpen] = useState(false);
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const addTab = () => {
    if (!newPlatform || !newUrl) return;
    const platform = platformOptions.find(p => p.value === newPlatform);
    if (!platform) return;
    const id = Date.now().toString();
    const tab: SocialTab = {
      id,
      platform: platform.label,
      url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
      icon: platform.icon,
      color: platform.color,
    };
    setTabs(prev => [...prev, tab]);
    setActiveTab(id);
    setNewPlatform('');
    setNewUrl('');
    setAddOpen(false);
  };

  const removeTab = (id: string) => {
    setTabs(prev => prev.filter(t => t.id !== id));
    if (activeTab === id) {
      setActiveTab(tabs[0]?.id || '');
    }
  };

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-foreground">YAT Social</h1>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Network
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Add Social Network</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div>
                  <Label>Platform</Label>
                  <Select value={newPlatform} onValueChange={v => {
                    setNewPlatform(v);
                    const p = platformOptions.find(o => o.value === v);
                    if (p && p.baseUrl) setNewUrl(p.baseUrl);
                  }}>
                    <SelectTrigger><SelectValue placeholder="Choose platform" /></SelectTrigger>
                    <SelectContent>
                      {platformOptions.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          <span className="flex items-center gap-2">{p.icon}{p.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>URL or Profile Link</Label>
                  <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." />
                </div>
                <Button className="w-full" onClick={addTab}>Open in Tab</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Browser-style Tabs */}
      {tabs.length > 0 ? (
        <div className="flex-1 flex flex-col">
          {/* Tab bar */}
          <div className="bg-muted border-b border-border flex items-center gap-0.5 px-2 py-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-colors max-w-[180px] group ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground border border-b-0 border-border'
                    : 'text-muted-foreground hover:bg-card/50'
                }`}
              >
                <span className={tab.color}>{tab.icon}</span>
                <span className="truncate">{tab.platform}</span>
                <button
                  onClick={e => { e.stopPropagation(); removeTab(tab.id); }}
                  className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </button>
            ))}
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center justify-center h-7 w-7 rounded text-muted-foreground hover:bg-card/50 transition-colors shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* URL bar */}
          {activeTabData && (
            <div className="bg-card border-b border-border px-3 py-1.5 flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full px-3 py-1 text-xs text-muted-foreground truncate flex items-center gap-2">
                <Globe className="h-3 w-3 shrink-0" />
                {activeTabData.url}
              </div>
              <a href={activeTabData.url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          )}

          {/* iframe content */}
          {activeTabData && (
            <div className="flex-1 bg-muted">
              <iframe
                src={activeTabData.url}
                className="w-full h-full min-h-[calc(100vh-12rem)] border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                title={activeTabData.platform}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div className="space-y-3">
            <Globe className="h-16 w-16 text-muted-foreground/30 mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">No networks connected</h2>
            <p className="text-sm text-muted-foreground max-w-sm">Add your social media profiles to browse them directly inside YAT.</p>
            <Button onClick={() => setAddOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Network
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Social;
