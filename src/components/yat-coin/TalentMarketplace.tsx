
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, TrendingUp, Users, Search, Filter } from 'lucide-react';

const TalentMarketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const talents = [
    {
      id: 1,
      name: 'Alex Chen',
      title: 'Full-Stack Developer',
      category: 'Technology',
      tokenPrice: '$45.20',
      marketCap: '$226K',
      change: '+12.5%',
      rating: 4.9,
      investors: 45,
      skills: ['React', 'Node.js', 'AI/ML'],
      image: '/placeholder.svg',
      projects: 8,
      description: 'Building the next generation of AI-powered web applications'
    },
    {
      id: 2,
      name: 'Maria Rodriguez',
      title: 'Digital Artist',
      category: 'Creative',
      tokenPrice: '$32.80',
      marketCap: '$164K',
      change: '+8.7%',
      rating: 4.8,
      investors: 32,
      skills: ['Digital Art', 'NFTs', 'Brand Design'],
      image: '/placeholder.svg',
      projects: 12,
      description: 'Creating immersive digital experiences and NFT collections'
    },
    {
      id: 3,
      name: 'David Kim',
      title: 'Growth Marketer',
      category: 'Marketing',
      tokenPrice: '$28.90',
      marketCap: '$145K',
      change: '+15.2%',
      rating: 4.7,
      investors: 28,
      skills: ['Growth Hacking', 'SEO', 'Analytics'],
      image: '/placeholder.svg',
      projects: 6,
      description: 'Scaling startups from 0 to 1M users with data-driven strategies'
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      title: 'Content Creator',
      category: 'Media',
      tokenPrice: '$38.50',
      marketCap: '$192K',
      change: '+6.3%',
      rating: 4.9,
      investors: 67,
      skills: ['Video Production', 'Storytelling', 'Social Media'],
      image: '/placeholder.svg',
      projects: 15,
      description: 'Viral content creator with 500K+ followers across platforms'
    }
  ];

  const categories = ['all', 'Technology', 'Creative', 'Marketing', 'Media', 'Business'];

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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search talents, skills, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTalents.map(talent => (
          <Card key={talent.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={talent.image} alt={talent.name} />
                  <AvatarFallback>{talent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{talent.name}</h3>
                  <p className="text-sm text-gray-600">{talent.title}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{talent.description}</p>
              
              <div className="flex flex-wrap gap-1">
                {talent.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Token Price</p>
                  <p className="font-semibold">{talent.tokenPrice}</p>
                </div>
                <div>
                  <p className="text-gray-600">Market Cap</p>
                  <p className="font-semibold">{talent.marketCap}</p>
                </div>
                <div>
                  <p className="text-gray-600">24h Change</p>
                  <p className="font-semibold text-green-600">{talent.change}</p>
                </div>
                <div>
                  <p className="text-gray-600">Investors</p>
                  <p className="font-semibold">{talent.investors}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{talent.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>{talent.projects} projects</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" size="sm" onClick={() => window.location.href = `/yat-coin`}>
                  Invest Now
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.location.href = `/talent/${talent.id}`}>
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTalents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No talents found matching your criteria.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default TalentMarketplace;
