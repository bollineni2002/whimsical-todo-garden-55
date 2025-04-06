import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  timeout?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading application...', 
  timeout = 15000 
}) => {
  const [progress, setProgress] = useState(0);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [dots, setDots] = useState('');

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        // Slow down progress as it gets higher
        const increment = Math.max(1, 10 - Math.floor(prev / 10));
        const newProgress = Math.min(99, prev + increment);
        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Handle timeout
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTimeoutReached(true);
      setProgress(100);
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [timeout]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50"
    >
      <div className="w-full max-w-md px-4 flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        
        <div className="w-full bg-muted rounded-full h-2.5 mb-4 overflow-hidden">
          <motion.div 
            className="bg-primary h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <p className="text-center text-muted-foreground mb-2">
          {message}{dots}
        </p>
        
        {timeoutReached && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              This is taking longer than expected. You can:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>Check your internet connection</li>
              <li>Refresh the page</li>
              <li>Try again later</li>
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
