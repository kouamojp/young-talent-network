
import React from 'react';
import { tr } from '@/i18n';

const SidebarTrending: React.FC = () => {
  return (
    <div className="mt-auto pt-4 border-t border-white/20 mt-8">
      <h3 className="font-medium mb-2">{tr('sidebarTrending.trendingTalents')}</h3>
      <ul className="space-y-2 text-sm">
        {['Music', 'Sports', 'Art', 'Dance', 'Technology'].map(category => (
          <li key={category} className="hover:underline cursor-pointer">
            #{category}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarTrending;
