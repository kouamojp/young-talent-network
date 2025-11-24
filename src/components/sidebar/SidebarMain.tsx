
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  mainNavigationItems, 
  servicesItems
} from './sidebarData';
import { MenuSectionItem } from './types';
import { Separator } from '@/components/ui/separator';
import { AISearchDialog } from '@/components/ai/AISearchDialog';
import { QuickCreateDialog } from '@/components/create/QuickCreateDialog';

const SidebarMain: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [aiSearchOpen, setAiSearchOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<'post' | 'event' | 'job' | 'course' | 'page'>('post');

  const isActive = (path: string) => {
    if (path.includes('?')) {
      const basePath = path.split('?')[0];
      const queryParam = path.split('?')[1];
      return currentPath === path || (currentPath.startsWith(basePath) && currentPath.includes(queryParam));
    }
    return currentPath === path;
  };

  const renderMenuItem = (item: MenuSectionItem) => {
    const active = isActive(item.path);
    const content = (
      <>
        <item.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
        <span className="ml-3 truncate text-sm">{item.label}</span>
      </>
    );

    const className = `flex items-center px-3 py-2 rounded-md transition-colors ${
      active 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'text-foreground hover:bg-muted'
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
      <Link to={item.path} className={className}>
        {content}
      </Link>
    );
  };

  return (
    <>
      <aside className="w-full h-full bg-card">
        <nav className="p-2 space-y-1">
          {/* Main Navigation */}
          {mainNavigationItems.map((item) => (
            <div key={item.label}>
              {renderMenuItem(item)}
            </div>
          ))}
          
          <Separator className="my-3" />
          
          {/* Services */}
          {servicesItems.map((item) => (
            <div key={item.label}>
              {renderMenuItem(item)}
            </div>
          ))}
        </nav>
      </aside>
      
      <AISearchDialog open={aiSearchOpen} onOpenChange={setAiSearchOpen} />
      <QuickCreateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} type={createType} />
    </>
  );
};

export default SidebarMain;
