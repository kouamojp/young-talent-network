
import React from 'react';
import { connectItems } from './sidebarData';

const SidebarSocial: React.FC = () => {
  return (
    <div className="mt-6 pt-4 border-t border-white/20">
      <h3 className="font-medium mb-2">Connect</h3>
      <ul className="space-y-1">
        {connectItems.map((item) => (
          <li key={item.label}>
            <a 
              href={item.url || item.path}
              target={item.url ? "_blank" : undefined}
              rel={item.url ? "noopener noreferrer" : undefined}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 transition-colors"
            >
              <item.icon className="h-5 w-5 text-blue-600" />
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarSocial;
