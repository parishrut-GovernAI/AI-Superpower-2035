
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

export const Header: React.FC = () => {
  const { t } = useLanguage();
  return (
    <header className="text-center p-4 md:p-6 border-b border-purple-500/30 relative">
      <h1 className="text-3xl md:text-5xl font-bold font-orbitron text-purple-400 tracking-widest">
        {t('headerTitle')}
      </h1>
      <div className="absolute top-1/2 right-4 -translate-y-1/2">
        <LanguageSelector />
      </div>
    </header>
  );
};