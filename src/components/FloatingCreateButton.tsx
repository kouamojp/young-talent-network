import React, { useState } from 'react';
import { Plus, FileText, Camera, Film, Radio, X } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { PostCreationDialog } from './PostCreationDialog';

const FloatingCreateButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname.startsWith('/messages')) return null;

  const actions = [
    { icon: FileText, label: t('create.post'), color: 'bg-blue-500', action: 'post' },
    { icon: Camera, label: t('create.story'), color: 'bg-pink-500', action: 'story' },
    { icon: Film, label: t('create.clip'), color: 'bg-purple-500', action: 'clip' },
    { icon: Radio, label: t('create.live'), color: 'bg-red-500', action: 'live' },
  ];

  const handleAction = (action: string) => {
    setIsOpen(false);
    if (action === 'live') navigate('/live');
    if (action === 'story') navigate('/media');
    if (action === 'clip') navigate('/media');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 transition-opacity" onClick={() => setIsOpen(false)} />
      )}

      {/* Action items */}
      <div className={`fixed bottom-20 md:bottom-8 right-4 z-50 flex flex-col-reverse items-end gap-3 transition-all ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {actions.map((item, i) => (
          item.action === 'post' ? (
            <PostCreationDialog
              key={item.action}
              trigger={
                <button className="flex items-center gap-3 group" style={{ transitionDelay: `${i * 50}ms` }}>
                  <span className="bg-card text-foreground text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
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
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <span className="bg-card text-foreground text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
              <div className={`${item.color} text-white h-12 w-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}>
                <item.icon className="h-5 w-5" />
              </div>
            </button>
          )
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 md:bottom-8 right-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center transition-transform hover:scale-105 ${isOpen ? 'rotate-45' : ''}`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </>
  );
};

export default FloatingCreateButton;
