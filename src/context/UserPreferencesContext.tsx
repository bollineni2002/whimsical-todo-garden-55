import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { LanguageCode } from '@/lib/languages';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Define currency formats
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export const currencies = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

// Define date formats
export type DateFormatType = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export const dateFormats = [
  { code: 'DD/MM/YYYY', example: '31/12/2023' },
  { code: 'MM/DD/YYYY', example: '12/31/2023' },
  { code: 'YYYY-MM-DD', example: '2023-12-31' },
];

// Define view types
export type ViewType = 'dashboard' | 'list';

// Define theme types
export type ThemeType = 'light' | 'dark' | 'system';

// Define font sizes
export type FontSizeType = 'small' | 'medium' | 'large';

// User preferences interface
export interface UserPreferences {
  language: LanguageCode;
  currency: CurrencyCode;
  dateFormat: DateFormatType;
  defaultView: ViewType;
  theme: ThemeType;
  fontSize: FontSizeType;
}

// Default preferences
export const defaultPreferences: UserPreferences = {
  language: 'en',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  defaultView: 'dashboard',
  theme: 'system',
  fontSize: 'medium',
};

// Context type
type UserPreferencesContextType = {
  preferences: UserPreferences;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
  isLoading: boolean;
};

// Create context
const UserPreferencesContext = createContext<UserPreferencesContextType>({
  preferences: defaultPreferences,
  updatePreferences: async () => {},
  isLoading: true,
});

// Provider component
export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load preferences from local storage or database
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // Try to get preferences from Supabase
          const { data, error } = await supabase
            .from('user_preferences')
            .select('preferences')
            .eq('user_id', user.id)
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            setPreferences({ ...defaultPreferences, ...data.preferences });
          } else {
            // If no preferences exist in the database, save the defaults
            await supabase.from('user_preferences').insert({
              user_id: user.id,
              preferences: defaultPreferences,
            });
          }
        } else {
          // If not logged in, try to get from localStorage
          const savedPrefs = localStorage.getItem('userPreferences');
          if (savedPrefs) {
            setPreferences({ ...defaultPreferences, ...JSON.parse(savedPrefs) });
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        // If there's an error, fall back to defaults or localStorage
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
          setPreferences({ ...defaultPreferences, ...JSON.parse(savedPrefs) });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Apply theme preference immediately when it changes
  useEffect(() => {
    const applyTheme = () => {
      if (preferences.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (preferences.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System preference
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    applyTheme();
    
    // Apply font size
    const applyFontSize = () => {
      document.documentElement.dataset.fontSize = preferences.fontSize;
      
      // Add appropriate CSS classes based on font size
      if (preferences.fontSize === 'small') {
        document.documentElement.classList.add('text-sm');
        document.documentElement.classList.remove('text-base', 'text-lg');
      } else if (preferences.fontSize === 'medium') {
        document.documentElement.classList.add('text-base');
        document.documentElement.classList.remove('text-sm', 'text-lg');
      } else {
        document.documentElement.classList.add('text-lg');
        document.documentElement.classList.remove('text-sm', 'text-base');
      }
    };
    
    applyFontSize();
  }, [preferences.theme, preferences.fontSize]);

  // Update preferences
  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPrefs };
    setPreferences(updatedPreferences);
    
    // Save to localStorage for all users
    localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
    
    // If logged in, also save to database
    if (user) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            preferences: updatedPreferences,
          }, { onConflict: 'user_id' });
          
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error updating preferences:', error);
      }
    }
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreferences, isLoading }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

// Custom hook to use the context
export const useUserPreferences = () => useContext(UserPreferencesContext);
