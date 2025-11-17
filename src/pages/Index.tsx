
import React from 'react';
import Feed from '@/components/Feed';

const Index: React.FC = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-2xl">
        <Feed />
      </div>
    </div>
  );
};

export default Index;
