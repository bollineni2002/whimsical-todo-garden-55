import React, { useState, useCallback } from 'react';
import DailyLogsList from '@/components/daily-logs/DailyLogsList';
import ForceSyncButton from '@/components/common/ForceSyncButton';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const DailyLogsPage: React.FC = () => {
  const [key, setKey] = useState(0); // Used to force re-render of components
  const { user } = useAuth();

  const handleSyncComplete = useCallback(async () => {
    // Force re-render of components by changing the key
    setKey(prevKey => prevKey + 1);
  }, []);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Daily Logs</h1>
          <p className="text-muted-foreground mt-2">
            Track your daily income and expenses
          </p>
        </div>
        <ForceSyncButton onSyncComplete={handleSyncComplete} className="self-end" />
      </div>

      <DailyLogsList key={`daily-logs-${key}`} />
    </div>
  );
};

export default DailyLogsPage;
