
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Eye, Users, MessageSquare } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Profile Views',
      value: '2,847',
      change: '+12%',
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: 'Engagement',
      value: '456',
      change: '+8%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Followers',
      value: '1,234',
      change: '+15%',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Messages',
      value: '89',
      change: '+23%',
      icon: MessageSquare,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-green-600">{stat.change} this week</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalyticsDashboard;
