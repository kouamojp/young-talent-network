import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CalendarIcon, Search, Star, User, Video } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const SportsCategories: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample sport categories
  const sportCategories = [
    { 
      id: '1', 
      name: 'Football', 
      icon: '⚽️', 
      followers: '250K', 
      description: 'The world\'s most popular sport'
    },
    { 
      id: '2', 
      name: 'Basketball', 
      icon: '🏀', 
      followers: '180K', 
      description: 'Fast-paced indoor and outdoor game'
    },
    { 
      id: '3', 
      name: 'Tennis', 
      icon: '🎾', 
      followers: '120K', 
      description: 'Individual or doubles racket sport'
    },
    { 
      id: '4', 
      name: 'Swimming', 
      icon: '🏊‍♂️', 
      followers: '90K', 
      description: 'Water based competitive sport'
    },
    { 
      id: '5', 
      name: 'Athletics', 
      icon: '🏃‍♀️', 
      followers: '85K', 
      description: 'Track and field events'
    },
    { 
      id: '6', 
      name: 'Cycling', 
      icon: '🚴‍♂️', 
      followers: '70K', 
      description: 'Road and track bicycle racing'
    },
  ];

  // Sample news items
  const sportsNews = [
    {
      id: '1',
      title: 'World Cup Qualifying Round Results',
      timestamp: '2h ago',
      image: '/placeholder.svg'
    },
    {
      id: '2',
      title: 'Olympic Committee Announces New Events',
      timestamp: '5h ago',
      image: '/placeholder.svg'
    },
    {
      id: '3',
      title: 'Basketball Championship Finals Schedule',
      timestamp: '1d ago',
      image: '/placeholder.svg'
    }
  ];

  // Sample upcoming events
  const upcomingEvents = [
    {
      id: '1',
      title: 'Football World Cup',
      date: 'June 15, 2025',
      location: 'Multiple Countries'
    },
    {
      id: '2',
      title: 'Tennis Grand Slam',
      date: 'July 2, 2025',
      location: 'London, UK'
    },
    {
      id: '3',
      title: 'Swimming Championship',
      date: 'August 10, 2025',
      location: 'Sydney, Australia'
    }
  ];

  // Sample videos
  const featuredVideos = [
    {
      id: '1',
      title: 'Top 10 Goals of the Season',
      views: '1.2M',
      duration: '12:45',
      thumbnail: '/placeholder.svg'
    },
    {
      id: '2',
      title: 'Basketball Slam Dunk Highlights',
      views: '876K',
      duration: '8:30',
      thumbnail: '/placeholder.svg'
    },
    {
      id: '3',
      title: 'Tennis Championship Final Match',
      views: '654K',
      duration: '25:10',
      thumbnail: '/placeholder.svg'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header section with teal background */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-4">{t('sports.sportsCategories')}</h1>
          <p className="text-lg opacity-90 mb-6">Discover sports events, news, and connect with athletes worldwide</p>
          
          {/* Search bar */}
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-100" />
            <Input 
              type="text" 
              placeholder="Search for sports, events, or athletes" 
              className="w-full bg-white/20 border-none text-white placeholder:text-gray-100 pl-10 py-5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1 mb-6">
            <TabsTrigger value="all">{t('sports.allCategories')}</TabsTrigger>
            <TabsTrigger value="events">{t('sports.events')}</TabsTrigger>
            <TabsTrigger value="news">{t('sports.news')}</TabsTrigger>
            <TabsTrigger value="videos">{t('sports.videos')}</TabsTrigger>
            <TabsTrigger value="athletes">{t('sports.athletes')}</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {/* Featured categories grid */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('sports.sportsCategories')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sportCategories.map((category) => (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-3xl">{category.icon}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          <p className="text-sm text-gray-500">{category.followers} followers</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{category.description}</p>
                    </CardContent>
                    <CardFooter className="bg-gray-50 px-5 py-3">
                      <Button variant="outline" size="sm" className="w-full">Follow</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>

            {/* Latest news */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Latest News</h2>
                <Button variant="ghost" size="sm">See all</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sportsNews.map((news) => (
                  <Card key={news.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-full h-40 object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="font-medium">{news.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{news.timestamp}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Featured videos */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Featured Videos</h2>
                <Button variant="ghost" size="sm">See all</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredVideos.map((video) => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {video.duration}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium">{video.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{video.views} views</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Calendar events */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Upcoming Events</h2>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Calendar View
                </Button>
              </div>
              <div className="bg-white rounded-lg shadow border border-gray-100">
                {upcomingEvents.map((event, index) => (
                  <div key={event.id} className={`p-4 flex justify-between items-center
                    ${index < upcomingEvents.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-blue-600">{event.date}</div>
                      <Button variant="link" size="sm" className="px-0">Add to calendar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Other tab contents would go here */}
          <TabsContent value="events" className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Upcoming Sports Events</h2>
            {/* Events content would go here */}
          </TabsContent>
          
          <TabsContent value="news" className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Sports News</h2>
            {/* News content would go here */}
          </TabsContent>
          
          <TabsContent value="videos" className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Sports Videos</h2>
            {/* Videos content would go here */}
          </TabsContent>
          
          <TabsContent value="athletes" className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Top Athletes</h2>
            {/* Athletes content would go here */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SportsCategories;
