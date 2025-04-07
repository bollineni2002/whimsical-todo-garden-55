
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/floating-add-button.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './lib/languages';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext'; // Import CurrencyProvider

// Declare the global clearAppLoadTimeout function
declare global {
  interface Window {
    clearAppLoadTimeout?: () => void;
  }
}

const root = createRoot(document.getElementById('root')!);

// Render the app
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <CurrencyProvider> {/* Wrap App with CurrencyProvider */}
            <App />
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
);

// Clear the app load timeout to indicate successful loading
if (window.clearAppLoadTimeout) {
  window.clearAppLoadTimeout();
}
