
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme;
    }
    // Default to system preference
    return 'system';
  });
  
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const savedSize = localStorage.getItem('fontSize') as FontSize;
    if (savedSize && ['small', 'medium', 'large'].includes(savedSize)) {
      return savedSize;
    }
    return 'medium';
  });
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Apply the theme whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('theme', theme);
    
    const applyTheme = (dark: boolean) => {
      if (dark) {
        root.classList.add('dark');
        setIsDarkMode(true);
      } else {
        root.classList.remove('dark');
        setIsDarkMode(false);
      }
    };
    
    if (theme === 'system') {
      // Use media query to detect system preference
      const isDarkPreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(isDarkPreferred);
      
      // Set up listener for changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Apply manual theme
      applyTheme(theme === 'dark');
    }
  }, [theme]);
  
  // Apply font size whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('fontSize', fontSize);
    
    // Remove any existing font size classes
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    
    // Apply the appropriate font size class
    switch (fontSize) {
      case 'small':
        root.classList.add('text-sm');
        break;
      case 'medium':
        root.classList.add('text-base');
        break;
      case 'large':
        root.classList.add('text-lg');
        break;
    }
  }, [fontSize]);
  
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };
  
  const setFontSize = (newSize: FontSize) => {
    setFontSizeState(newSize);
  };
  
  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      fontSize, 
      setFontSize,
      isDarkMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
