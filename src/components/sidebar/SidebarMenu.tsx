
import React from 'react';
import { Link } from 'react-router-dom';
import { menuItems } from './sidebarData';

const SidebarMenu: React.FC = () => {
  return (
    <nav>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.label}>
            <Link 
              to={item.path}
              className="flex flex-col gap-1 p-3 rounded-lg hover:bg-white/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              <span className="text-xs text-gray-600 pl-8">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SidebarMenu;
