
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the available languages
export type LanguageCode = 'en' | 'es' | 'hi' | 'fr' | 'de' | 'zh' | 'ja' | 'ar' | 'ru' | 'pt';

interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
];

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  getLanguageLabel: (code: LanguageCode) => string;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    const savedLanguage = localStorage.getItem('language') as LanguageCode;
    return savedLanguage && languages.some(lang => lang.code === savedLanguage) 
      ? savedLanguage 
      : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
    document.documentElement.lang = currentLanguage;
    
    // In a production app, you would load language resources here
  }, [currentLanguage]);

  const setLanguage = (code: LanguageCode) => {
    if (languages.some(lang => lang.code === code)) {
      setCurrentLanguage(code);
    }
  };

  const getLanguageLabel = (code: LanguageCode): string => {
    const lang = languages.find(l => l.code === code);
    return lang ? `${lang.nativeName} (${lang.name})` : code;
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    setLanguage,
    getLanguageLabel,
    languages,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
