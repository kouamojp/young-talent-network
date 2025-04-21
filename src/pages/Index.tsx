
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import Feed from '@/components/Feed';
import RightSidebar from '@/components/RightSidebar';
import { Button } from '@/components/ui/button';
import { Facebook, Category, CalendarDays, Tv, TestTube, Briefcase, Book, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

// Main categories to show on the home page
const mainCategories = [
  {
    key: 'categories',
    label: 'Categories',
    icon: <Category className="h-8 w-8 text-purple-600" />,
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
];

const Index: React.FC = () => {
  useEffect(() => {
    // Intersection Observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-section').forEach((element) => {
      observer.observe(element);
    });

    return () => {
      document.querySelectorAll('.animate-section').forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto flex flex-col md:flex-row">
        <SocialSidebar />
        <main className="flex-1 min-h-screen">
          {/* MAIN CATEGORIES SECTION */}
          <section className="mt-24 pb-8 animate-section">
            <div className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-900">Welcome to Young & Talented</h1>
              <p className="text-lg text-gray-600">
                Explore everything Y&T has to offer! Choose your path below.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 px-2">
              {mainCategories.map((cat) => (
                <Link to={cat.link} key={cat.key} className={`flex flex-col items-center rounded-xl shadow-sm hover:shadow-md transition-all p-6 ${cat.color} group hover-scale`}>
                  <div className="mb-2">{cat.icon}</div>
                  <h3 className="text-lg font-semibold group-hover:underline">{cat.label}</h3>
                  <p className="text-sm text-gray-500 mb-4 text-center">{cat.description}</p>
                  <Button variant="outline" className="w-full mt-auto group-hover:bg-primary group-hover:text-white transition-colors">
                    Go to {cat.label}
                  </Button>
                </Link>
              ))}
            </div>
          </section>
          {/* FACEBOOK CONNECT SECTION */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-md mb-6 animate-section">
            <h2 className="text-2xl font-bold mb-4">Connect with Facebook</h2>
            <p className="mb-4">Link your Facebook account to find friends, share achievements, and expand your network.</p>
            <Link to="/auth">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Facebook className="mr-2 h-5 w-5" />
                Connect with Facebook
              </Button>
            </Link>
          </div>
          <Feed />
        </main>
        <RightSidebar />
      </div>
      <Footer />
    </div>
  );
};

export default Index;

