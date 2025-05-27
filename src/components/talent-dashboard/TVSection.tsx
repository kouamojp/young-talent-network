
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Tv, Upload, DollarSign, Users, Play, Settings } from 'lucide-react';

const TVSection: React.FC = () => {
  const [hasChannel, setHasChannel] = useState(true);
  const [channelStats] = useState({
    name: 'Cooking with Maria',
    subscribers: 1247,
    totalViews: 45623,
    revenue: 2340,
    episodesUploaded: 24
  });

  const [episodes] = useState([
    {
      id: 1,
      title: 'Italian Pasta Masterclass',
      uploadDate: '2024-12-10',
      views: 2847,
      duration: '25:30',
      status: 'Published',
      thumbnail: '/placeholder.svg'
    },
    {
      id: 2,
      title: 'Quick Breakfast Ideas',
      uploadDate: '2024-12-08',
      views: 1564,
      duration: '15:45',
      status: 'Published',
      thumbnail: '/placeholder.svg'
    },
    {
      id: 3,
      title: 'Holiday Desserts Special',
      uploadDate: 'Draft',
      views: 0,
      duration: '30:12',
      status: 'Draft',
      thumbnail: '/placeholder.svg'
    }
  ]);

  if (!hasChannel) {
    return (
      <div className="text-center py-12">
        <Tv className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Create Your Personal TV Channel</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Launch your own 24/7 streaming channel. Upload shows, schedule live streams, 
          and monetize your content with subscriptions and sponsorships.
        </p>
        <Button onClick={() => setHasChannel(true)} size="lg">
          <Tv className="h-5 w-5 mr-2" />
          Create TV Channel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channel Overview */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">{channelStats.name}</h3>
              <p className="opacity-90">Your Personal TV Channel</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Channel Settings
              </Button>
              <Button variant="secondary" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Go Live
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm opacity-80">Subscribers</p>
              <p className="text-xl font-bold">{channelStats.subscribers.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Total Views</p>
              <p className="text-xl font-bold">{channelStats.totalViews.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Revenue</p>
              <p className="text-xl font-bold">${channelStats.revenue}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Episodes</p>
              <p className="text-xl font-bold">{channelStats.episodesUploaded}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Management */}
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold">📡 Content Library</h4>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Episode
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Live
          </Button>
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {episodes.map((episode) => (
          <Card key={episode.id} className="hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
              <Play className="h-8 w-8 text-gray-400" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-semibold text-sm">{episode.title}</h5>
                <Badge 
                  variant={episode.status === 'Published' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {episode.status}
                </Badge>
              </div>
              
              <div className="text-xs text-gray-600 space-y-1">
                <p>Duration: {episode.duration}</p>
                <p>
                  {episode.status === 'Published' 
                    ? `${episode.views.toLocaleString()} views • ${episode.uploadDate}`
                    : episode.uploadDate === 'Draft' ? 'Draft' : `Scheduled: ${episode.uploadDate}`
                  }
                </p>
              </div>

              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  Edit
                </Button>
                <Button size="sm" className="flex-1 text-xs">
                  {episode.status === 'Published' ? 'View' : 'Publish'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monetization */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <DollarSign className="h-5 w-5" />
            Monetization Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <h6 className="font-semibold">Subscriptions</h6>
              <p className="text-sm text-gray-600">Monthly recurring revenue</p>
              <p className="text-lg font-bold text-green-600">$5.99/month</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Tv className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h6 className="font-semibold">Ad Revenue</h6>
              <p className="text-sm text-gray-600">Monetize with ads</p>
              <p className="text-lg font-bold text-blue-600">$0.05/view</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Badge className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <h6 className="font-semibold">Sponsorships</h6>
              <p className="text-sm text-gray-600">Brand partnerships</p>
              <p className="text-lg font-bold text-purple-600">Custom rates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TVSection;
