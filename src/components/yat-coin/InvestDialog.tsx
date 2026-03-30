import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, CreditCard, Wallet, ArrowUpRight, BarChart3, Heart, Trophy } from 'lucide-react';

type InvestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  talent: {
    name: string;
    title: string;
    tokenPrice: string;
    marketCap: string;
    change: string;
    rating: number;
  } | null;
};

const InvestDialog: React.FC<InvestDialogProps> = ({ open, onOpenChange, talent }) => {
  const [investAmount, setInvestAmount] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [activeTab, setActiveTab] = useState('invest');

  if (!talent) return null;

  const price = parseFloat(talent.tokenPrice.replace('$', ''));
  const tokens = investAmount ? (parseFloat(investAmount) / price).toFixed(2) : '0';

  const performanceData = [
    { period: '7 days', change: '+5.2%', color: 'text-green-600' },
    { period: '30 days', change: '+12.8%', color: 'text-green-600' },
    { period: '90 days', change: '+28.4%', color: 'text-green-600' },
    { period: 'All time', change: '+67.1%', color: 'text-green-600' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Invest in {talent.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invest">Invest</TabsTrigger>
            <TabsTrigger value="credit">Load Credit</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="invest" className="space-y-4">
            {/* Token Info */}
            <Card className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Token Price</p>
                  <p className="text-2xl font-bold">{talent.tokenPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <p className="text-lg font-semibold text-green-600 flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4" />
                    {talent.change}
                  </p>
                </div>
              </div>
            </Card>

            {/* Investment Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Investment Amount ($)</label>
              <Input
                type="number"
                placeholder="Enter amount..."
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
              />
              <div className="flex gap-2">
                {['50', '100', '250', '500'].map(amt => (
                  <Button key={amt} variant="outline" size="sm" onClick={() => setInvestAmount(amt)} className="flex-1">
                    ${amt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Token Preview */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex justify-between">
                <span className="text-sm">You'll receive</span>
                <span className="font-bold">{tokens} tokens</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm">Estimated annual return</span>
                <span className="font-bold text-green-600">~{investAmount ? (parseFloat(investAmount) * 0.237).toFixed(2) : '0'} $</span>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full" disabled={!investAmount || parseFloat(investAmount) <= 0}>
                <Wallet className="h-4 w-4 mr-2" />
                Invest {investAmount ? `$${investAmount}` : ''}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Motivate Talent
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <Trophy className="h-4 w-4 mr-2" />
                  Follow Progress
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="credit" className="space-y-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
              <p className="text-3xl font-bold">$0.00</p>
            </Card>

            <div className="space-y-2">
              <label className="text-sm font-medium">Load Amount ($)</label>
              <Input
                type="number"
                placeholder="Enter amount..."
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
              <div className="flex gap-2">
                {['100', '250', '500', '1000'].map(amt => (
                  <Button key={amt} variant="outline" size="sm" onClick={() => setCreditAmount(amt)} className="flex-1">
                    ${amt}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Payment Method</p>
              <Card className="p-3 cursor-pointer hover:bg-muted/50 border-2 border-primary flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Credit / Debit Card</p>
                  <p className="text-xs text-muted-foreground">Visa, Mastercard, etc.</p>
                </div>
              </Card>
              <Card className="p-3 cursor-pointer hover:bg-muted/50 flex items-center gap-3">
                <Wallet className="h-5 w-5" />
                <div>
                  <p className="font-medium text-sm">Crypto Wallet</p>
                  <p className="text-xs text-muted-foreground">ETH, BTC, USDT</p>
                </div>
              </Card>
            </div>

            <Button className="w-full" disabled={!creditAmount}>
              <CreditCard className="h-4 w-4 mr-2" />
              Load {creditAmount ? `$${creditAmount}` : 'Credit'}
            </Button>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Performance</h3>
              </div>
              <div className="space-y-3">
                {performanceData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{item.period}</span>
                    <span className={`font-semibold ${item.color}`}>{item.change}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Revenue Share Model</h3>
              <p className="text-sm text-muted-foreground mb-3">
                As an investor, you earn a percentage of this talent's revenue based on your token holdings.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Your investment share</span>
                  <span className="font-medium">0%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Revenue distribution</span>
                  <Badge variant="secondary">Monthly</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Token buy/sell</span>
                  <Badge variant="secondary">Anytime</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
              <p className="text-xs text-muted-foreground">
                ⚠️ Investing in talents carries risk. Token values fluctuate based on talent performance. Past performance doesn't guarantee future results.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default InvestDialog;
