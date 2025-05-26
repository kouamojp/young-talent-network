
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Target, Eye } from 'lucide-react';

const InvestorDashboard: React.FC = () => {
  const [investmentAmount, setInvestmentAmount] = useState('');

  const portfolio = [
    {
      id: 1,
      name: 'Alex Chen',
      title: 'Full-Stack Developer',
      tokenPrice: '$45.20',
      invested: '$2,500',
      currentValue: '$2,812',
      return: '+12.5%',
      tokensOwned: 55,
      category: 'Technology'
    },
    {
      id: 2,
      name: 'Maria Rodriguez',
      title: 'Digital Artist',
      tokenPrice: '$32.80',
      invested: '$1,800',
      currentValue: '$1,956',
      return: '+8.7%',
      tokensOwned: 60,
      category: 'Creative'
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      title: 'Content Creator',
      tokenPrice: '$38.50',
      invested: '$3,200',
      currentValue: '$3,401',
      return: '+6.3%',
      tokensOwned: 88,
      category: 'Media'
    }
  ];

  const watchlist = [
    {
      id: 4,
      name: 'David Kim',
      title: 'Growth Marketer',
      tokenPrice: '$28.90',
      change: '+15.2%',
      category: 'Marketing',
      momentum: 'High'
    },
    {
      id: 5,
      name: 'Emily Zhang',
      title: 'UI/UX Designer',
      tokenPrice: '$35.40',
      change: '+7.8%',
      category: 'Design',
      momentum: 'Medium'
    }
  ];

  const totalInvested = portfolio.reduce((sum, item) => sum + parseFloat(item.invested.replace('$', '').replace(',', '')), 0);
  const totalValue = portfolio.reduce((sum, item) => sum + parseFloat(item.currentValue.replace('$', '').replace(',', '')), 0);
  const totalReturn = ((totalValue - totalInvested) / totalInvested * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold">${totalInvested.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
              <PieChart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Return</p>
                <p className="text-2xl font-bold text-green-600">+{totalReturn}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Talents Backed</p>
                <p className="text-2xl font-bold">{portfolio.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Investments</h3>
            <Button>
              Add Investment
            </Button>
          </div>

          <div className="space-y-4">
            {portfolio.map(investment => (
              <Card key={investment.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {investment.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{investment.name}</h4>
                        <p className="text-sm text-gray-600">{investment.title}</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">Token Price</p>
                      <p className="font-semibold">{investment.tokenPrice}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">Invested</p>
                      <p className="font-semibold">{investment.invested}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">Current Value</p>
                      <p className="font-semibold">{investment.currentValue}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">Return</p>
                      <p className="font-semibold text-green-600">{investment.return}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm">
                        Trade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Watchlist</h3>
            <Button variant="outline">
              Browse More Talents
            </Button>
          </div>

          <div className="space-y-4">
            {watchlist.map(talent => (
              <Card key={talent.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {talent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{talent.name}</h4>
                        <p className="text-sm text-gray-600">{talent.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-semibold">{talent.tokenPrice}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-600">24h Change</p>
                        <p className="font-semibold text-green-600">{talent.change}</p>
                      </div>

                      <Badge 
                        variant={talent.momentum === 'High' ? 'default' : 'secondary'}
                      >
                        {talent.momentum} Momentum
                      </Badge>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Amount"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          className="w-24"
                        />
                        <Button>
                          Invest
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Best Performer</span>
                    <span className="font-semibold text-green-600">David Kim (+15.2%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Worst Performer</span>
                    <span className="font-semibold text-red-600">Sarah Johnson (+6.3%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Return</span>
                    <span className="font-semibold">+9.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Technology</span>
                    <span className="font-semibold">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Creative</span>
                    <span className="font-semibold">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Media</span>
                    <span className="font-semibold">25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestorDashboard;
