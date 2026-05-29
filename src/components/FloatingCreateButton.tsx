import React, { useState } from 'react';
import { Plus, FileText, Camera, Film, Radio, X, Newspaper, Zap } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { PostCreationDialog } from './PostCreationDialog';
import { useIsMobile } from '@/hooks/use-mobile';

const FloatingCreateButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  if (location.pathname.startsWith('/messages')) return null;

  const actions = [
    { icon: FileText, label: t('create.post') || 'Publication', color: 'bg-blue-500', action: 'post' },
    { icon: Camera, label: t('create.story') || 'Story', color: 'bg-pink-500', action: 'story' },
    { icon: Zap, label: 'Short', color: 'bg-purple-500', action: 'short' },
    { icon: Film, label: t('create.clip') || 'Vidéo', color: 'bg-fuchsia-500', action: 'clip' },
    { icon: Newspaper, label: 'Article', color: 'bg-amber-500', action: 'article' },
    { icon: Radio, label: t('create.live') || 'Live', color: 'bg-red-500', action: 'live' },
  ];

  const handleAction = (action: string) => {
    setIsOpen(false);
    if (action === 'live') navigate('/live');
    if (action === 'story') navigate('/feed');
    if (action === 'short') navigate('/media?tab=shorts');
    if (action === 'clip') navigate('/media?tab=videos');
    if (action === 'article') navigate('/articles');
  };

  const labelClass = `bg-card text-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-[55] transition-opacity" onClick={() => setIsOpen(false)} />
      )}

      {/* Action items */}
      <div className={`fixed bottom-24 md:bottom-24 right-4 z-[60] flex flex-col-reverse items-end gap-3 transition-all ${isOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'}`}>
        {actions.map((item, i) => (
          item.action === 'post' ? (
            <PostCreationDialog
              key={item.action}
              trigger={
                <button className="flex items-center gap-3 group" style={{ transitionDelay: `${i * 40}ms` }}>
                  <span className={labelClass}>{item.label}</span>
                  <div className={`${item.color} text-white h-12 w-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                </button>
              }
            />
          ) : (
            <button
              key={item.action}
              onClick={() => handleAction(item.action)}
              className="flex items-center gap-3 group"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <span className={labelClass}>{item.label}</span>
              <div className={`${item.color} text-white h-12 w-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}>
                <item.icon className="h-5 w-5" />
              </div>
            </button>
          )
        ))}
      </div>

      {/* Main FAB — bumped above bottom nav (z-60) and lifted on mobile so it never sits behind the tab bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Créer"
        className={`fixed bottom-20 md:bottom-8 right-4 z-[60] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center transition-transform hover:scale-105 ${isOpen ? 'rotate-45' : ''}`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </>
  );
};

export default FloatingCreateButton;
