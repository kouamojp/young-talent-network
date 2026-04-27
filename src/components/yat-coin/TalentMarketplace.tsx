import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, TrendingUp, Search } from 'lucide-react';
import InvestDialog from './InvestDialog';
import TalentProfileDialog from './TalentProfileDialog';
import { useLanguage } from '@/i18n/LanguageContext';

const talents = [
  {
    id: 1, name: 'Alex Chen', title: 'Full-Stack Developer', category: 'Technology',
    tokenPrice: '$45.20', marketCap: '$226K', change: '+12.5%', rating: 4.9,
    investors: 45, skills: ['React', 'Node.js', 'AI/ML'], image: '/placeholder.svg',
    projects: 8, description: 'Building the next generation of AI-powered web applications'
  },
  {
    id: 2, name: 'Maria Rodriguez', title: 'Digital Artist', category: 'Creative',
    tokenPrice: '$32.80', marketCap: '$164K', change: '+8.7%', rating: 4.8,
    investors: 32, skills: ['Digital Art', 'NFTs', 'Brand Design'], image: '/placeholder.svg',
    projects: 12, description: 'Creating immersive digital experiences and NFT collections'
  },
  {
    id: 3, name: 'David Kim', title: 'Growth Marketer', category: 'Marketing',
    tokenPrice: '$28.90', marketCap: '$145K', change: '+15.2%', rating: 4.7,
    investors: 28, skills: ['Growth Hacking', 'SEO', 'Analytics'], image: '/placeholder.svg',
    projects: 6, description: 'Scaling startups from 0 to 1M users with data-driven strategies'
  },
  {
    id: 4, name: 'Sarah Johnson', title: 'Content Creator', category: 'Media',
    tokenPrice: '$38.50', marketCap: '$192K', change: '+6.3%', rating: 4.9,
    investors: 67, skills: ['Video Production', 'Storytelling', 'Social Media'], image: '/placeholder.svg',
    projects: 15, description: 'Viral content creator with 500K+ followers across platforms'
  }
];

const categories = ['all', 'Technology', 'Creative', 'Marketing', 'Media', 'Business'];

const TalentMarketplace: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<typeof talents[0] | null>(null);

  const filteredTalents = talents.filter(talent => {
    const matchesSearch = talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || talent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder={t('marketplace.searchTalents')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button key={category} variant={selectedCategory === category ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(category)} className="capitalize">
              {category === 'all' ? t('talentMkt.all') : category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTalents.map(talent => (
          <Card key={talent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={talent.image} alt={talent.name} />
                  <AvatarFallback>{talent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{talent.name}</h3>
                  <p className="text-sm text-muted-foreground">{talent.title}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{talent.description}</p>
              <div className="flex flex-wrap gap-1">
                {talent.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">{t('marketplace.tokenPrice')}</p><p className="font-semibold">{talent.tokenPrice}</p></div>
                <div><p className="text-muted-foreground">{t('marketplace.marketCap')}</p><p className="font-semibold">{talent.marketCap}</p></div>
                <div><p className="text-muted-foreground">{t('marketplace.24hChange')}</p><p className="font-semibold text-green-600">{talent.change}</p></div>
                <div><p className="text-muted-foreground">{t('marketplace.investors')}</p><p className="font-semibold">{talent.investors}</p></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{talent.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>{talent.projects} {t('marketplace.projects')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm" onClick={() => { setSelectedTalent(talent); setInvestDialogOpen(true); }}>
                  {t('marketplace.investNow')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/talent/${talent.id}`)}
                >
                  {t('marketplace.viewProfile')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTalents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('marketplace.noTalents')}</p>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="mt-4">{t('marketplace.clearFilters')}</Button>
        </div>
      )}

      <InvestDialog open={investDialogOpen} onOpenChange={setInvestDialogOpen} talent={selectedTalent} />
      <TalentProfileDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} talent={selectedTalent} onInvest={() => { setProfileDialogOpen(false); setInvestDialogOpen(true); }} />
    </div>
  );
};

export default TalentMarketplace;
