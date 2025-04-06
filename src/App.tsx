
import React, { useState, useEffect } from "react";
import { initializeStorage } from "./lib/storage-init";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/ui/loading-screen";
import ErrorBoundary from "@/components/ErrorBoundary";
import SimpleErrorBoundary from "@/components/SimpleErrorBoundary";
import SafeMode from "@/components/SafeMode";
import FallbackApp from "./FallbackApp";
import Index from "./pages/Index";
import TransactionDetail from "./pages/TransactionDetail";
import NotFound from "./pages/NotFound";
import NewTransaction from "./pages/NewTransaction";
import Auth from "./pages/Auth";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import BuyersSellers from "./pages/BuyersSellers";
import DailyLogs from "./pages/DailyLogs";
import { useAuth, AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import { LanguageProvider } from './lib/languages'; // Import LanguageProvider
import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider
import { CurrencyProvider } from './context/CurrencyContext'; // Import CurrencyProvider

// Create a client
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading your account..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [hasError, setHasError] = useState(false);
  const [isSafeMode, setIsSafeMode] = useState(false);

  // Check if we should use the fallback app or safe mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isFallback = urlParams.get('fallback') === 'true';
    const safeMode = urlParams.get('safe') === 'true';

    // Set safe mode state
    setIsSafeMode(safeMode);

    // If in fallback mode, don't do anything else
    if (isFallback) {
      return;
    }

    // If in safe mode, log it
    if (safeMode) {
      console.log('Running in safe mode - limited functionality');
    }

    // Initialize Supabase storage
    initializeStorage()
      .then(success => {
        if (success) {
          console.log('Supabase storage initialized successfully');
        } else {
          console.warn('Failed to initialize Supabase storage, some features may not work properly');
        }
      })
      .catch(error => {
        console.error('Error initializing Supabase storage:', error);
      });

    // Add global error handler
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Global error:', { message, source, lineno, colno, error });

      // Only set error state for critical errors
      if (message && (
        message.toString().includes('ChunkLoadError') ||
        message.toString().includes('Loading chunk') ||
        message.toString().includes('Loading CSS chunk') ||
        message.toString().includes('Unexpected token') ||
        message.toString().includes('SyntaxError') ||
        message.toString().includes('Cannot read property') ||
        message.toString().includes('undefined is not an object') ||
        message.toString().includes('null is not an object')
      )) {
        setHasError(true);

        // Store error info in sessionStorage for the fallback app
        try {
          sessionStorage.setItem('app_error', JSON.stringify({
            message: message.toString(),
            source,
            lineno,
            colno,
            stack: error?.stack,
            time: new Date().toISOString()
          }));
        } catch (e) {
          console.error('Failed to store error info:', e);
        }
      }

      // Call the original handler if it exists
      if (typeof originalOnError === 'function') {
        return originalOnError(message, source, lineno, colno, error);
      }

      return false;
    };

    // Add unhandled rejection handler
    const originalOnUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = function(event: PromiseRejectionEvent) { // Use regular function with type
      console.error('Unhandled promise rejection:', event.reason);

      // Only set error state for critical errors
      if (event.reason && (
        (event.reason.message && (
          event.reason.message.includes('ChunkLoadError') ||
          event.reason.message.includes('Loading chunk') ||
          event.reason.message.includes('Network Error') ||
          event.reason.message.includes('Failed to fetch') ||
          event.reason.message.includes('NetworkError') ||
          event.reason.message.includes('AbortError')
        )) ||
        (event.reason.toString && (
          event.reason.toString().includes('SyntaxError') ||
          // Handle Supabase storage errors
          event.reason.toString().includes('Cannot read properties of undefined')
        ))
      )) {
        setHasError(true);

        // Store error info in sessionStorage for the fallback app
        try {
          sessionStorage.setItem('app_error', JSON.stringify({
            message: event.reason.message || event.reason.toString(),
            stack: event.reason.stack,
            time: new Date().toISOString()
          }));
        } catch (e) {
          console.error('Failed to store error info:', e);
        }
      }

      // Call the original handler if it exists, explicitly binding 'this'
      if (typeof originalOnUnhandledRejection === 'function') {
        // Use .call() to set the 'this' context to window
        return originalOnUnhandledRejection.call(window, event);
      }
    };

    // Cleanup
    return () => {
      window.onerror = originalOnError;
      window.onunhandledrejection = originalOnUnhandledRejection;
    };
  }, []);

  // If there's a critical error, redirect to fallback app
  useEffect(() => {
    if (hasError) {
      console.log('Critical error detected, redirecting to fallback app...');
      window.location.href = '/?fallback=true';
    }
  }, [hasError]);

  // Check if we should use the fallback app or safe mode
  const urlParams = new URLSearchParams(window.location.search);
  const isFallback = urlParams.get('fallback') === 'true';
  const safeMode = urlParams.get('safe') === 'true';

  if (isFallback) {
    return <FallbackApp />;
  }

  // Render SafeMode within necessary providers if safe mode is active
  if (safeMode || isSafeMode) {
    // We need AuthProvider for SafeMode's useAuth hook
    // Include others for consistency, though SafeMode might not use them directly
    return (
      <React.StrictMode>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <CurrencyProvider>
                <SafeMode />
              </CurrencyProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </React.StrictMode>
    );
  }

  // Normal App rendering (already wrapped in providers in main.tsx)
  return (
  <React.StrictMode>
    <SimpleErrorBoundary>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <AnimatePresence mode="wait">
              <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/transaction/:id" element={
                <ProtectedRoute>
                  <TransactionDetail />
                </ProtectedRoute>
              } />
              <Route path="/new-transaction" element={
                <ProtectedRoute>
                  <NewTransaction />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              {/* Clients route removed - using embedded clients tab in Index page instead */}
              <Route path="/contacts" element={
                <ProtectedRoute>
                  <BuyersSellers />
                </ProtectedRoute>
              } />
              <Route path="/daily-logs" element={
                <ProtectedRoute>
                  <DailyLogs />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SimpleErrorBoundary>
  </React.StrictMode>
  );
};

export default App;
