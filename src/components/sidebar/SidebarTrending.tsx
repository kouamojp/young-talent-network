
import React from 'react';

const SidebarTrending: React.FC = () => {
  return (
    <div className="mt-auto pt-4 border-t border-white/20 mt-8">
      <h3 className="font-medium mb-2">Talents Tendance</h3>
      <ul className="space-y-2 text-sm">
        {['Musique', 'Sports', 'Art', 'Danse', 'Technologie'].map(category => (
          <li key={category} className="hover:underline cursor-pointer">
            #{category}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarTrending;
