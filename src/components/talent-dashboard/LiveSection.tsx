
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Radio, Calendar, Clock, Users, ExternalLink } from 'lucide-react';

const LiveSection: React.FC = () => {
  const [pastStreams] = useState([
    {
      id: 1,
      title: 'Design System Deep Dive',
      platform: 'YouTube',
      date: 'Dec 10, 2024',
      duration: '2h 15m',
      viewers: 847,
      url: 'https://youtube.com/watch?v=example'
    },
    {
      id: 2,
      title: 'React Best Practices',
      platform: 'Twitch',
      date: 'Dec 8, 2024',
      duration: '1h 45m',
      viewers: 234,
      url: 'https://twitch.tv/example'
    }
  ]);

  const [upcomingStreams] = useState([
    {
      id: 1,
      title: 'Live Portfolio Review',
      platform: 'Zoom',
      date: '2024-12-20',
      time: '14:00',
      registered: 67,
      maxAttendees: 100
    },
    {
      id: 2,
      title: 'Q&A Session: Career in Tech',
      platform: 'YouTube Live',
      date: '2024-12-22',
      time: '18:00',
      registered: 156,
      maxAttendees: 500
    }
  ]);

  const getTimeUntil = (date: string, time: string) => {
    const streamDate = new Date(`${date}T${time}`);
    const now = new Date();
    const diff = streamDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Live Streaming</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Stream
        </Button>
      </div>

      {/* Upcoming Streams */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">🔜 Upcoming Streams</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingStreams.map((stream) => (
            <Card key={stream.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h5 className="font-semibold">{stream.title}</h5>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {getTimeUntil(stream.date, stream.time)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Radio className="h-3 w-3" />
                    {stream.platform}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(stream.date).toLocaleDateString()} at {stream.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    {stream.registered} / {stream.maxAttendees} registered
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1">
                    Edit
                  </Button>
                  <Button size="sm" className="flex-1">
                    Go Live
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Past Streams */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">🎥 Past Lives</h4>
        <div className="space-y-3">
          {pastStreams.map((stream) => (
            <Card key={stream.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold mb-1">{stream.title}</h5>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Radio className="h-3 w-3" />
                        {stream.platform}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {stream.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {stream.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {stream.viewers} viewers
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Integration Platforms */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">🔗 Platform Integrations</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="justify-start">
              <Radio className="h-4 w-4 mr-2" />
              YouTube Live
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Radio className="h-4 w-4 mr-2" />
              Twitch
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Radio className="h-4 w-4 mr-2" />
              Zoom
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Radio className="h-4 w-4 mr-2" />
              LinkedIn Live
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveSection;
