
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import GlassMorphism from '@/components/GlassMorphism';
import { Newspaper, Calendar, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const News: React.FC = () => {
  const newsArticles = [
    {
      id: 1,
      title: 'New Talent Program Launched',
      excerpt: 'Y&T has launched a new program to help young talents find opportunities in the industry.',
      date: '2023-06-15',
      category: 'Announcement'
    },
    {
      id: 2, 
      title: 'Success Story: From Y&T to Broadway',
      excerpt: 'Read the inspiring journey of Jennifer Adams who went from being a Y&T member to starring in a Broadway show.',
      date: '2023-06-10',
      category: 'Success Story'
    },
    {
      id: 3,
      title: 'Upcoming Talent Competition',
      excerpt: 'Don\'t miss the annual Y&T talent competition happening next month. Registration is now open!',
      date: '2023-06-05',
      category: 'Event'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto flex flex-col md:flex-row">
        <SocialSidebar />
        <main className="flex-1 p-4">
          <GlassMorphism className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Newspaper className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Y&T News & Updates</h1>
            </div>
            
            <Tabs defaultValue="latest">
              <TabsList className="mb-4">
                <TabsTrigger value="latest">Latest</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="success">Success Stories</TabsTrigger>
              </TabsList>
              
              <TabsContent value="latest" className="space-y-4">
                {newsArticles.map(article => (
                  <GlassMorphism key={article.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                        <p className="text-gray-600">{article.excerpt}</p>
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{article.date}</span>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded-full">{article.category}</span>
                      <button className="text-sm text-primary hover:underline">Read more</button>
                    </div>
                  </GlassMorphism>
                ))}
              </TabsContent>
              
              <TabsContent value="trending">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5" />
                  <h2 className="text-lg font-medium">Trending News</h2>
                </div>
                <p>Most popular news and updates in the Y&T community...</p>
              </TabsContent>
              
              <TabsContent value="events">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5" />
                  <h2 className="text-lg font-medium">Event News</h2>
                </div>
                <p>News about upcoming and past events...</p>
              </TabsContent>
              
              <TabsContent value="success">
                <h2 className="text-lg font-medium mb-4">Success Stories</h2>
                <p>Inspiring stories of Y&T members who achieved their dreams...</p>
              </TabsContent>
            </Tabs>
          </GlassMorphism>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default News;
