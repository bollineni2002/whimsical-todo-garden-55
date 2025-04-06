import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertTriangle, CheckCircle, Home, RefreshCw } from 'lucide-react';

const SafeMode: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isFixing, setIsFixing] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
    console.log(message);
  };

  const handleFixIssues = async () => {
    setIsFixing(true);
    addLog('Starting to fix application issues...');

    try {
      // Clear localStorage
      addLog('Clearing localStorage...');
      localStorage.clear();

      // Clear sessionStorage
      addLog('Clearing sessionStorage...');
      sessionStorage.clear();

      // Clear IndexedDB
      addLog('Clearing IndexedDB...');
      await clearIndexedDB();

      // Clear service worker caches
      addLog('Clearing service worker caches...');
      await clearCaches();

      // Unregister service workers
      addLog('Unregistering service workers...');
      await unregisterServiceWorkers();

      addLog('All issues fixed successfully!');
      setIsFixed(true);
    } catch (error) {
      addLog(`Error fixing issues: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsFixing(false);
    }
  };

  const clearIndexedDB = async () => {
    return new Promise<void>((resolve, reject) => {
      try {
        const databases = ['app-db', 'buyers-db', 'sellers-db', 'transactions-db', 'daily-logs-db'];
        let completed = 0;
        let hasError = false;

        databases.forEach(dbName => {
          try {
            const request = indexedDB.deleteDatabase(dbName);

            request.onsuccess = function() {
              addLog(`Database ${dbName} deleted successfully`);
              completed++;
              if (completed === databases.length && !hasError) {
                resolve();
              }
            };

            request.onerror = function(event) {
              addLog(`Error deleting database ${dbName}`);
              hasError = true;
              reject(new Error(`Error deleting database ${dbName}`));
            };
          } catch (e) {
            addLog(`Error attempting to delete database ${dbName}`);
            hasError = true;
            reject(e);
          }
        });

        // In case there are no databases to delete
        if (databases.length === 0) {
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const clearCaches = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            addLog(`Deleting cache ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
      } catch (error) {
        addLog(`Error clearing caches: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  const unregisterServiceWorkers = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => {
            addLog('Unregistering service worker');
            return registration.unregister();
          })
        );
      } catch (error) {
        addLog(`Error unregistering service workers: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  const handleReturnToApp = () => {
    window.location.href = '/';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/auth';
    } catch (error) {
      addLog(`Error signing out: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-yellow-50 border-b border-yellow-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <CardTitle>Safe Mode</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-gray-700 mb-4">
            The application is running in safe mode due to an error. This mode provides limited functionality to help recover from issues.
          </p>

          {user ? (
            <p className="text-sm text-gray-500 mb-4">
              Logged in as: {user.email}
            </p>
          ) : (
            <p className="text-sm text-gray-500 mb-4">
              Not logged in
            </p>
          )}

          <div className="space-y-4">
            {!isFixed ? (
              <Button
                className="w-full"
                onClick={handleFixIssues}
                disabled={isFixing}
              >
                {isFixing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fixing Issues...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Fix Application Issues
                  </>
                )}
              </Button>
            ) : (
              <div className="p-3 bg-green-50 text-green-700 rounded-md flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Issues fixed successfully!</span>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={handleReturnToApp}
            >
              <Home className="mr-2 h-4 w-4" />
              Return to Application
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>

          {logs.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Logs:</h3>
              <div className="bg-gray-100 p-2 rounded-md max-h-40 overflow-y-auto text-xs font-mono">
                {logs.map((log, index) => (
                  <div key={index} className="py-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SafeMode;
