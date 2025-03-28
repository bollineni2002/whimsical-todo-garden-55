import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currencyCode: string) => void;
  formatCurrency: (value: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Helper to get default currency from localStorage
const getDefaultCurrency = (): string => {
  try {
    return localStorage.getItem('currency') || 'USD'; // Default to USD
  } catch (error) {
    console.error("Failed to read currency from localStorage:", error);
    return 'USD'; // Fallback default
  }
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>(getDefaultCurrency);

  // Update localStorage whenever currency changes
  useEffect(() => {
    try {
      localStorage.setItem('currency', currency);
    } catch (error) {
      console.error("Failed to save currency to localStorage:", error);
    }
  }, [currency]);

  // Function to update currency state
  const setCurrency = (currencyCode: string) => {
    setCurrencyState(currencyCode);
  };

  // Formatting function using Intl.NumberFormat
  const formatCurrency = useCallback((value: number): string => {
    if (isNaN(value)) {
      return ''; // Or return a default like 'N/A' or '0.00' based on requirements
    }
    try {
      return new Intl.NumberFormat(undefined, { // Use user's locale settings for number formatting
        style: 'currency',
        currency: currency,
        // minimumFractionDigits: 2, // Optional: Ensure at least 2 decimal places
        // maximumFractionDigits: 2, // Optional: Ensure at most 2 decimal places
      }).format(value);
    } catch (error) {
      console.error(`Failed to format currency ${currency}:`, error);
      // Fallback formatting if Intl fails for the given currency code
      return `${currency} ${value.toFixed(2)}`; 
    }
  }, [currency]); // Recreate formatter if currency changes

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use the Currency context
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
