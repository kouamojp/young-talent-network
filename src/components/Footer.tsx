import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear().toString();

  const links = [
    'footer.about',
    'footer.privacy',
    'footer.terms',
    'footer.cookies',
    'footer.help',
    'footer.careers',
    'footer.advertising',
  ];

  return (
    <footer className="hidden md:block border-t border-border bg-card py-2 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center gap-x-1 text-[11px] text-muted-foreground leading-relaxed">
          <LanguageSwitcher />
          {links.map((key, i) => (
            <span key={key} className="inline-flex items-center">
              <a href="#" className="hover:underline">{t(key)}</a>
              {i < links.length - 1 && <span className="mx-0.5">·</span>}
            </span>
          ))}
          <span className="ml-auto">{t('footer.copyright', { year })}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
