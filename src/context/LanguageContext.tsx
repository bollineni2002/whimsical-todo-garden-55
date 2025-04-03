
import React, { createContext, useContext, useState, useEffect } from 'react';

// Available languages with their native and English names
export const AVAILABLE_LANGUAGES = {
  en: { native: 'English', english: 'English' },
  es: { native: 'Español', english: 'Spanish' },
  hi: { native: 'हिन्दी', english: 'Hindi' },
  fr: { native: 'Français', english: 'French' },
  de: { native: 'Deutsch', english: 'German' },
  zh: { native: '中文', english: 'Chinese' },
  ja: { native: '日本語', english: 'Japanese' },
  ar: { native: 'العربية', english: 'Arabic' },
  ru: { native: 'Русский', english: 'Russian' },
  pt: { native: 'Português', english: 'Portuguese' },
};

export type LanguageCode = keyof typeof AVAILABLE_LANGUAGES;

type LanguageContextType = {
  language: LanguageCode;
  changeLanguage: (code: LanguageCode) => void;
  getLanguageLabel: (code: LanguageCode) => string;
  availableLanguages: typeof AVAILABLE_LANGUAGES;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Get the saved language from localStorage or default to English
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const savedLanguage = localStorage.getItem('language') as LanguageCode;
    return savedLanguage && Object.keys(AVAILABLE_LANGUAGES).includes(savedLanguage)
      ? savedLanguage
      : 'en';
  });

  // Save to localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem('language', language);
    // You could add more language-specific operations here
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = (code: LanguageCode) => {
    setLanguage(code);
  };

  const getLanguageLabel = (code: LanguageCode) => {
    const lang = AVAILABLE_LANGUAGES[code];
    return `${lang.native} (${lang.english})`;
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        changeLanguage, 
        getLanguageLabel,
        availableLanguages: AVAILABLE_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
