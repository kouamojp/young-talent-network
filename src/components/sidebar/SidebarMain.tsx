
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { allSections } from './sidebarData';
import { MenuSectionItem } from './types';
import { Separator } from '@/components/ui/separator';

interface SidebarMainProps {
  onNavigate?: () => void;
}

const SidebarMain: React.FC<SidebarMainProps> = ({ onNavigate }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '#') return false;
    if (path === '/') return currentPath === '/';
    return currentPath === path;
  };

  const renderMenuItem = (item: MenuSectionItem) => {
    const active = isActive(item.path);
    const content = (
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-muted">
          <item.icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-sm font-medium truncate ${active ? 'text-primary' : 'text-foreground'}`}>
            {item.label}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            {item.description}
          </span>
        </div>
      </div>
    );

    const className = `flex items-center px-3 py-2 rounded-lg transition-colors ${
      active 
        ? 'bg-primary/10' 
        : 'hover:bg-muted'
    }`;

    if (item.url) {
      return (
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={className}
        >
          {content}
        </a>
      );
    }

    return (
      <Link to={item.path} className={className} onClick={onNavigate}>
        {content}
      </Link>
    );
  };

  return (
    <aside className="w-full h-full bg-card">
      <nav className="p-3 space-y-4">
        {allSections.map((section, idx) => (
          <div key={section.title}>
            {idx > 0 && <Separator className="mb-3" />}
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <div key={item.label}>
                  {renderMenuItem(item)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SidebarMain;
