
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Gem, TrendingUp, TrendingDown } from 'lucide-react';

interface TalentValueProps {
  tokenPrice: number;
  priceChange: number;
}

const TalentValue: React.FC<TalentValueProps> = ({ tokenPrice, priceChange }) => {
  // Mock data for investors
  const investors = [
    { id: 1, name: "Alex", avatar: "/placeholder.svg", amount: "$500" },
    { id: 2, name: "Sam", avatar: "/placeholder.svg", amount: "$750" },
    { id: 3, name: "Jordan", avatar: "/placeholder.svg", amount: "$1000" },
  ];

  const skillTrends = [
    { skill: "React", trend: "up", change: "+15%" },
    { skill: "Design", trend: "up", change: "+8%" },
    { skill: "AI/ML", trend: "down", change: "-3%" },
  ];

  return (
    <Card className="bg-white/10 border-white/20 text-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gem className="h-5 w-5 animate-bounce" />
          <h3 className="font-semibold">💎 My Value</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">${tokenPrice.toFixed(2)}</span>
            <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-sm">{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%</span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-white/80 mb-2">My Investors ({investors.length})</p>
            <div className="flex -space-x-2">
              {investors.map((investor) => (
                <Avatar key={investor.id} className="w-8 h-8 border-2 border-white/20">
                  <AvatarImage src={investor.avatar} />
                  <AvatarFallback>{investor.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-white/80 mb-2">Skills Stock Market</p>
            <div className="space-y-1">
              {skillTrends.map((skill, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span>{skill.skill}</span>
                  <span className={skill.trend === 'up' ? 'text-green-400' : 'text-red-400'}>
                    {skill.trend === 'up' ? '↑' : '↓'} {skill.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TalentValue;
