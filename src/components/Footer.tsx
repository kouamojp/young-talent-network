import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear().toString();

  const links = [
    { key: 'footer.about', href: '#' },
    { key: 'footer.privacy', href: '#' },
    { key: 'footer.terms', href: '#' },
    { key: 'footer.cookies', href: '#' },
    { key: 'footer.help', href: '#' },
    { key: 'footer.careers', href: '#' },
    { key: 'footer.advertising', href: '#' },
  ];

  return (
    <footer className="hidden md:block border-t border-border bg-card py-3 px-4">
      <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {links.map((link) => (
          <a
            key={link.key}
            href={link.href}
            className="text-xs text-muted-foreground hover:underline"
          >
            {t(link.key)}
          </a>
        ))}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <span className="text-xs text-muted-foreground">
            {t('footer.copyright', { year })}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
