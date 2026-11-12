import React, { useState } from 'react';
import TranslateButton from './TranslateButton';
import { tr } from '@/i18n';

interface Props {
  text: string;
  className?: string;
}

const TranslatableText: React.FC<Props> = ({ text, className }) => {
  const [translation, setTranslation] = useState<{ text: string; lang: string } | null>(null);
  const shown = translation?.text ?? text;
  return (
    <div className="space-y-1">
      <p className={className}>{shown}</p>
      <div className="flex items-center gap-2">
        <TranslateButton
          text={text}
          currentLang={translation?.lang || null}
          onTranslated={(t, lang) => setTranslation(t && lang ? { text: t, lang } : null)}
        />
        {translation && <span className="text-[9px] italic opacity-70">{tr('common.translatedByAi')}</span>}
      </div>
    </div>
  );
};

export default TranslatableText;
