import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/types';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear().toString();

  // Les liens « À propos », « Aide », « Carrières » et « Publicité » n'avaient
  // pas de page : ils sont retirés jusqu'à ce qu'elles existent.
  const links: { key: TranslationKey; to: string }[] = [
    { key: 'footer.terms', to: '/legal/cgu' },
    { key: 'footer.privacy', to: '/legal/confidentialite' },
    { key: 'footer.cookies', to: '/legal/cookies' },
    { key: 'footer.legal', to: '/legal/mentions-legales' },
  ];

  return (
    <footer className="hidden md:block border-t border-border bg-card py-2 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center gap-x-1 text-[11px] text-muted-foreground leading-relaxed">
          <LanguageSwitcher />
          {links.map(({ key, to }, i) => (
            <span key={key} className="inline-flex items-center">
              <Link to={to} className="hover:underline">{t(key)}</Link>
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
