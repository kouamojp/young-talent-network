
import React from 'react';
import { socialLinks } from './sidebarData';

const SidebarSocial: React.FC = () => {
  return (
    <div className="mt-6 pt-4 border-t border-white/20">
      <h3 className="font-medium mb-2">Connecter</h3>
      <ul className="space-y-1">
        {socialLinks.map((item) => (
          <li key={item.label}>
            <a 
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
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
