import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Coins, TrendingUp, Users, Star, ArrowUpRight, DollarSign } from 'lucide-react';
import GlassMorphism from '@/components/GlassMorphism';
import TalentMarketplace from '@/components/yat-coin/TalentMarketplace';
import InvestorDashboard from '@/components/yat-coin/InvestorDashboard';
import TokenizeProfile from '@/components/yat-coin/TokenizeProfile';
import ProjectFunding from '@/components/yat-coin/ProjectFunding';
import { useLanguage } from '@/i18n/LanguageContext';

const YatCoin: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('marketplace');
  const [userType, setUserType] = useState<'talent' | 'investor' | null>(null);

  const stats = [
    { label: t('yatcoin.totalMarketCap'), value: '$2.4M', icon: DollarSign, change: '+12.5%' },
    { label: t('yatcoin.activeTalents'), value: '1,247', icon: Users, change: '+8.2%' },
    { label: t('yatcoin.fundedProjects'), value: '156', icon: TrendingUp, change: '+15.3%' },
    { label: t('yatcoin.averageROI'), value: '23.7%', icon: Star, change: '+4.1%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <main className="container mx-auto px-4 py-12">
        <GlassMorphism className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8 text-purple-600 shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{t('yatcoin.title')}</h1>
                <p className="text-gray-600 text-sm">{t('yatcoin.subtitle')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={userType === 'talent' ? 'default' : 'outline'} onClick={() => setUserType('talent')}>{t('yatcoin.imTalent')}</Button>
              <Button size="sm" variant={userType === 'investor' ? 'default' : 'outline'} onClick={() => setUserType('investor')}>{t('yatcoin.imInvestor')}</Button>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">{t('yatcoin.heroTitle')}</h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-6">{t('yatcoin.heroDesc')}</p>
          </div>

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
              <TabsTrigger value="marketplace">{t('yatcoin.talentMarketplace')}</TabsTrigger>
              <TabsTrigger value="tokenize">{t('yatcoin.tokenizeProfile')}</TabsTrigger>
              <TabsTrigger value="invest">{t('yatcoin.investmentHub')}</TabsTrigger>
              <TabsTrigger value="funding">{t('yatcoin.projectFunding')}</TabsTrigger>
            </TabsList>
            <TabsContent value="marketplace"><TalentMarketplace /></TabsContent>
            <TabsContent value="tokenize"><TokenizeProfile /></TabsContent>
            <TabsContent value="invest"><InvestorDashboard /></TabsContent>
            <TabsContent value="funding"><ProjectFunding /></TabsContent>
          </Tabs>
        </GlassMorphism>
      </main>
    </div>
  );
};

export default YatCoin;
