
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
  isFetchingTranslations: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => localStorage.getItem('language') || 'en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [fallbackTranslations, setFallbackTranslations] = useState<Record<string, string>>({});
  const [isFetchingTranslations, setIsFetchingTranslations] = useState<boolean>(true);

  useEffect(() => {
    const loadTranslations = async () => {
      setIsFetchingTranslations(true);
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error(`Could not load translations for ${language}, falling back to English.`, error);
        // Fallback to English if the selected language file fails to load
        if (language !== 'en') {
          setLanguageState('en');
        }
      } finally {
        setIsFetchingTranslations(false);
      }
    };

    const loadFallbackTranslations = async () => {
        try {
            const response = await fetch('/locales/en.json');
            if (!response.ok) throw new Error('Failed to load fallback translations');
            const data = await response.json();
            setFallbackTranslations(data);
        } catch (error) {
            console.error('Could not load fallback English translations.', error);
        }
    };
    
    loadFallbackTranslations();
    loadTranslations();
  }, [language]);

  const setLanguage = (lang: string) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = (key: string, replacements: { [key: string]: string | number } = {}): string => {
    let translation = translations[key] || fallbackTranslations[key] || key;
    
    Object.keys(replacements).forEach(placeholder => {
        const regex = new RegExp(`\\{\\{\\s*${placeholder}\\s*\\}\\}`, 'g');
        translation = translation.replace(regex, String(replacements[placeholder]));
    });

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isFetchingTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};
