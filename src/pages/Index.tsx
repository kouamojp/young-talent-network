
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Feed from '@/components/Feed';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-14">
        {/* Main feed - now full width */}
        <div className="w-full max-w-3xl mx-auto px-4">
          <div className="py-4">
            <Feed />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
