
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import Feed from '@/components/Feed';
import RightSidebar from '@/components/RightSidebar';
import { Button } from '@/components/ui/button';
import { Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

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

    // Observe all elements with animate-section class
    document.querySelectorAll('.animate-section').forEach((element) => {
      observer.observe(element);
    });

    return () => {
      // Cleanup observer
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
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-md mb-6 mt-24 animate-section">
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
