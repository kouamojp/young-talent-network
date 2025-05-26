
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, TrendingUp, Users, Star, ArrowUpRight, DollarSign } from 'lucide-react';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import TalentMarketplace from '@/components/yat-coin/TalentMarketplace';
import InvestorDashboard from '@/components/yat-coin/InvestorDashboard';
import TokenizeProfile from '@/components/yat-coin/TokenizeProfile';
import ProjectFunding from '@/components/yat-coin/ProjectFunding';

const YatCoin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [userType, setUserType] = useState<'talent' | 'investor' | null>(null);

  const stats = [
    { label: 'Total Market Cap', value: '$2.4M', icon: DollarSign, change: '+12.5%' },
    { label: 'Active Talents', value: '1,247', icon: Users, change: '+8.2%' },
    { label: 'Funded Projects', value: '156', icon: TrendingUp, change: '+15.3%' },
    { label: 'Average ROI', value: '23.7%', icon: Star, change: '+4.1%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <main className="container mx-auto px-4 py-12">
        <GlassMorphism className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  YAT COIN
                </h1>
                <p className="text-gray-600">Talent Exchange Platform</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={userType === 'talent' ? 'default' : 'outline'}
                onClick={() => setUserType('talent')}
              >
                I'm a Talent
              </Button>
              <Button 
                variant={userType === 'investor' ? 'default' : 'outline'}
                onClick={() => setUserType('investor')}
              >
                I'm an Investor
              </Button>
            </div>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Where Talent Meets Capital - Tokenize Your Potential
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-6">
              Revolutionary platform where individuals are valued like startups. Talents tokenize their skills, 
              investors fund human potential, and everyone benefits from transparent growth tracking and returns.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="h-3 w-3" />
                      <span className="text-xs">{stat.change}</span>
                    </div>
                  </div>
                  <stat.icon className="h-8 w-8 text-purple-600" />
                </div>
              </Card>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="marketplace">
                Talent Marketplace
              </TabsTrigger>
              <TabsTrigger value="tokenize">
                Tokenize Profile
              </TabsTrigger>
              <TabsTrigger value="invest">
                Investment Hub
              </TabsTrigger>
              <TabsTrigger value="funding">
                Project Funding
              </TabsTrigger>
            </TabsList>

            <TabsContent value="marketplace">
              <TalentMarketplace />
            </TabsContent>

            <TabsContent value="tokenize">
              <TokenizeProfile />
            </TabsContent>

            <TabsContent value="invest">
              <InvestorDashboard />
            </TabsContent>

            <TabsContent value="funding">
              <ProjectFunding />
            </TabsContent>
          </Tabs>
        </GlassMorphism>
      </main>
      <Footer />
    </div>
  );
};

export default YatCoin;
