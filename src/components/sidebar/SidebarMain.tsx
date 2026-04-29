import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { allSections } from './sidebarData';
import { MenuSectionItem } from './types';
import { Separator } from '@/components/ui/separator';
import SidebarCategories from './SidebarCategories';

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
      <div className="flex items-center gap-3 w-full">
        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg ${
          active ? 'bg-primary/15' : 'bg-muted'
        }`}>
          <item.icon className={`h-4 w-4 ${item.iconColor || 'text-muted-foreground'}`} />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-[13px] font-medium truncate ${active ? 'text-primary' : 'text-foreground'}`}>
              {item.label}
            </span>
            {item.badge && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-none ${item.badgeColor || 'bg-primary text-white'}`}>
                {item.badge}
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground truncate">
            {item.description}
          </span>
        </div>
      </div>
    );

    const className = `flex items-center px-2.5 py-1.5 rounded-lg transition-all duration-150 ${
      active 
        ? 'bg-primary/10 shadow-sm' 
        : 'hover:bg-muted/80'
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
      <nav className="p-2.5 space-y-3">
        {allSections.map((section, idx) => (
          <div key={section.title}>
            {idx > 0 && <Separator className="mb-2.5" />}
            <p className="px-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <div key={item.label + item.path}>
                  {renderMenuItem(item)}
                </div>
              ))}
            </div>
          </div>
        ))}
        <SidebarCategories onNavigate={onNavigate} />
      </nav>
    </aside>
  );
};

export default SidebarMain;
