
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import SocialSidebar from '@/components/SocialSidebar';
import Feed from '@/components/Feed';
import RightSidebar from '@/components/RightSidebar';
import { Button } from '@/components/ui/button';
import { Newspaper, Grid, CalendarDays, Tv, TestTube, Briefcase, Book, Video, Building, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

// Expanded main categories to show on the home page
const mainCategories = [
  {
    key: 'news',
    label: 'News',
    icon: <Newspaper className="h-8 w-8 text-emerald-600" />,
    description: 'Read the latest updates, stories, and announcements.',
    link: '/news',
    color: 'bg-emerald-50',
  },
  {
    key: 'categories',
    label: 'Categories',
    icon: <Grid className="h-8 w-8 text-purple-600" />,
    description: 'Explore all talent categories and specializations.',
    link: '/categories',
    color: 'bg-purple-50',
  },
  {
    key: 'events',
    label: 'Events',
    icon: <CalendarDays className="h-8 w-8 text-blue-600" />,
    description: 'Find and join upcoming events and competitions.',
    link: '/events',
    color: 'bg-blue-50',
  },
  {
    key: 'tv',
    label: 'TV',
    icon: <Tv className="h-8 w-8 text-pink-600" />,
    description: 'Watch inspiring stories and shows on Y&T TV.',
    link: '/tv',
    color: 'bg-pink-50',
  },
  {
    key: 'test',
    label: 'Test',
    icon: <TestTube className="h-8 w-8 text-green-600" />,
    description: 'Take the Aptitude Test and discover your strengths.',
    link: '/test',
    color: 'bg-green-50',
  },
  {
    key: 'work',
    label: 'Work',
    icon: <Briefcase className="h-8 w-8 text-orange-600" />,
    description: 'Find opportunities, jobs, and team up with organizations.',
    link: '/work',
    color: 'bg-orange-50',
  },
  {
    key: 'learning',
    label: 'Learning',
    icon: <Book className="h-8 w-8 text-yellow-600" />,
    description: 'Grow your skills through courses, trainings, and lessons.',
    link: '/learning',
    color: 'bg-yellow-50',
  },
  {
    key: 'live',
    label: 'Live',
    icon: <Video className="h-8 w-8 text-indigo-600" />,
    description: 'Join real-time events, streams, and more.',
    link: '/live',
    color: 'bg-indigo-50',
  },
  {
    key: 'organizations',
    label: 'Organizations',
    icon: <Building className="h-8 w-8 text-fuchsia-600" />,
    description: 'Connect with organizations and agencies worldwide.',
    link: '/organizations',
    color: 'bg-fuchsia-50',
  },
  {
    key: 'communities',
    label: 'Communities',
    icon: <Users className="h-8 w-8 text-cyan-600" />,
    description: 'Join communities and connect with like-minded talents.',
    link: '/communities',
    color: 'bg-cyan-50',
  },
];

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <main>
        <HeroSection />
        <CategorySection />
        <div className="container mx-auto px-4 py-12">
          <Feed />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
