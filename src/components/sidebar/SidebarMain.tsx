import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { allSections } from './sidebarData';
import { MenuSectionItem } from './types';
import { Separator } from '@/components/ui/separator';
import SidebarCategories from './SidebarCategories';
import { useLanguage } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/types';
import AdBanner from '@/components/AdBanner';

interface SidebarMainProps {
  onNavigate?: () => void;
}

const SidebarMain: React.FC<SidebarMainProps> = ({ onNavigate }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useLanguage();

  const isActive = (path: string) => {
    if (path === '#') return false;
    if (path === '/') return currentPath === '/';
    return currentPath === path;
  };

  const renderMenuItem = (item: MenuSectionItem) => {
    const active = isActive(item.path);
    const content = (
      <div className="flex items-center gap-3 w-full">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
          <item.icon className={`h-[18px] w-[18px] ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} strokeWidth={active ? 2.25 : 1.75} />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-[13.5px] truncate ${active ? 'font-semibold text-primary' : 'font-medium text-foreground'}`}>
              {t(item.label as TranslationKey)}
            </span>
            {item.badge && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-none ${item.badgeColor || 'bg-primary text-white'}`}>
                {item.badge}
              </span>
            )}
          </div>
          <span className="text-[11.5px] text-muted-foreground truncate">
            {t(item.description as TranslationKey)}
          </span>
        </div>
      </div>
    );

    const className = `group relative flex items-center px-2 py-1.5 rounded-lg transition-colors duration-150 ${
      active 
        ? 'bg-accent before:absolute before:-left-[5px] before:top-2 before:bottom-2 before:w-[3px] before:rounded-r-full before:bg-primary' 
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
      <nav className="px-[5px] pt-3 pb-0 space-y-3">
        {allSections.map((section, idx) => (
          <div key={section.titleKey}>
            {idx > 0 && <Separator className="mb-3" />}
            <p className="px-2 text-xs font-semibold text-muted-foreground mb-1">
              {t(section.titleKey as TranslationKey)}
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
        <div className="px-0.5 pb-3">
          <AdBanner placement="sidebar" />
        </div>
      </nav>
    </aside>
  );
};

export default SidebarMain;
