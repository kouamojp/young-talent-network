import React, { useState } from 'react';
import { Search, Plus, Star, MapPin, Filter, ShoppingBag, Tag, Heart, MessageSquare, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/i18n/LanguageContext';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  type: 'product' | 'service';
  seller: { name: string; avatar: string; rating: number };
  image: string;
  likes: number;
  views: number;
  location: string;
}

const mockItems: MarketplaceItem[] = [
  { id: '1', title: 'Personal Training Session', description: 'One-on-one fitness coaching tailored to your goals', price: 50, currency: '€', category: 'Coaching', type: 'service', seller: { name: 'Alex Martin', avatar: '', rating: 4.8 }, image: '', likes: 24, views: 180, location: 'Paris, France' },
  { id: '2', title: 'Custom Sport Jersey', description: 'Personalized team jerseys with your name and number', price: 35, currency: '€', category: 'Equipment', type: 'product', seller: { name: 'SportWear Pro', avatar: '', rating: 4.5 }, image: '', likes: 42, views: 320, location: 'Lyon, France' },
  { id: '3', title: 'Yoga & Meditation Workshop', description: 'Group session for flexibility and mindfulness', price: 25, currency: '€', category: 'Coaching', type: 'service', seller: { name: 'Zen Studio', avatar: '', rating: 4.9 }, image: '', likes: 67, views: 510, location: 'Online' },
  { id: '4', title: 'Used Running Shoes - Nike', description: 'Barely used, size 42, great condition', price: 40, currency: '€', category: 'Equipment', type: 'product', seller: { name: 'Marie L.', avatar: '', rating: 4.2 }, image: '', likes: 8, views: 95, location: 'Marseille, France' },
  { id: '5', title: 'Dance Choreography Service', description: 'Custom choreography for events and competitions', price: 120, currency: '€', category: 'Creative', type: 'service', seller: { name: 'DanceFlow', avatar: '', rating: 5.0 }, image: '', likes: 31, views: 240, location: 'Brussels, Belgium' },
  { id: '6', title: 'Resistance Bands Set', description: 'Professional grade, 5 levels of resistance', price: 22, currency: '€', category: 'Equipment', type: 'product', seller: { name: 'FitGear', avatar: '', rating: 4.6 }, image: '', likes: 55, views: 430, location: 'Berlin, Germany' },
];

const categories = ['All', 'Coaching', 'Equipment', 'Creative', 'Nutrition', 'Events', 'Digital'];

const Marketplace: React.FC = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('all');

  const filtered = mockItems.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchType = activeTab === 'all' || item.type === activeTab;
    return matchSearch && matchCategory && matchType;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-accent to-primary/5 px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold">
            <ShoppingBag className="h-4 w-4" /> {t('marketplace.title')}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">{t('marketplace.heroTitle')}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">{t('marketplace.heroDesc')}</p>
          <div className="flex items-center gap-2 max-w-lg mx-auto mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('marketplace.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-1.5"><Plus className="h-4 w-4" /> {t('marketplace.sell')}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{t('marketplace.createListing')}</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div><Label>{t('marketplace.title_field')}</Label><Input placeholder={t('marketplace.titlePlaceholder')} /></div>
                  <div><Label>{t('marketplace.description')}</Label><Textarea placeholder={t('marketplace.descPlaceholder')} rows={3} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{t('marketplace.price')}</Label><Input type="number" placeholder="0" /></div>
                    <div>
                      <Label>{t('marketplace.type')}</Label>
                      <Select><SelectTrigger><SelectValue placeholder={t('marketplace.select')} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">{t('marketplace.product')}</SelectItem>
                          <SelectItem value="service">{t('marketplace.service')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>{t('marketplace.category')}</Label>
                    <Select><SelectTrigger><SelectValue placeholder={t('marketplace.select')} /></SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">{t('marketplace.publish')}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <TabsList className="bg-muted">
                <TabsTrigger value="all">{t('marketplace.all')}</TabsTrigger>
                <TabsTrigger value="product">{t('marketplace.products')}</TabsTrigger>
                <TabsTrigger value="service">{t('marketplace.services')}</TabsTrigger>
              </TabsList>
              <div className="flex gap-1.5 overflow-x-auto">
                {categories.map(cat => (
                  <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat)} className="text-xs whitespace-nowrap">{cat}</Button>
                ))}
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      <div className="px-4 py-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-40 bg-gradient-to-br from-muted to-accent flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
                  </div>
                  <Badge variant={item.type === 'service' ? 'default' : 'secondary'} className="text-[10px] shrink-0 ml-2">
                    {item.type === 'service' ? t('marketplace.service') : t('marketplace.product')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {item.location}</div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-lg font-bold text-primary">{item.currency}{item.price}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{item.likes}</span>
                    <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{item.views}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">{item.seller.name.charAt(0)}</div>
                    <span className="text-xs text-muted-foreground">{item.seller.name}</span>
                    <span className="text-xs text-amber-500 flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-500" />{item.seller.rating}</span>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><MessageSquare className="h-3 w-3" /> {t('marketplace.contact')}</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{t('marketplace.noListings')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
