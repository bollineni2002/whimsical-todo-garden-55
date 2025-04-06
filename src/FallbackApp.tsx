import React, { useState, useEffect } from 'react';
import { supabaseSimple as supabase } from '@/integrations/supabase/simple-client';

const FallbackApp: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFixing, setIsFixing] = useState(false);
  const [user, setUser] = useState<any>(null);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  useEffect(() => {
    // Check if we're in fallback mode
    const urlParams = new URLSearchParams(window.location.search);
    const isFallback = urlParams.get('fallback') === 'true';

    if (!isFallback) {
      // If not in fallback mode, don't render anything
      return;
    }

    // Check for authentication
    const checkAuth = async () => {
      try {
        addLog('Checking authentication...');
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          addLog(`Authentication error: ${error.message}`);
          setError(`Authentication error: ${error.message}`);
          return;
        }

        if (!data.session) {
          addLog('No active session found');
          setError('No active session found. Please log in again.');
          return;
        }

        setUser(data.session.user);
        addLog(`Authenticated as ${data.session.user.email}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        addLog(`Error checking authentication: ${errorMessage}`);
        setError(`Error checking authentication: ${errorMessage}`);
      }
    };

    // checkAuth(); // Defer auth check to avoid errors blocking the fallback UI
  }, []);

  const handleClearLocalStorage = () => {
    try {
      localStorage.clear();
      addLog('Local storage cleared successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addLog(`Error clearing local storage: ${errorMessage}`);
    }
  };

  const handleClearIndexedDB = async () => {
    try {
      addLog('Attempting to clear IndexedDB...');

      // Get all IndexedDB databases
      const databases = await window.indexedDB.databases();

      if (databases.length === 0) {
        addLog('No IndexedDB databases found');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Delete each database
      for (const db of databases) {
        try {
          await new Promise<void>((resolve, reject) => {
            const request = window.indexedDB.deleteDatabase(db.name || '');
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error(`Failed to delete database ${db.name}`));
          });
          addLog(`Deleted database: ${db.name}`);
          successCount++;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          addLog(`Error deleting database ${db.name}: ${errorMessage}`);
          errorCount++;
        }
      }

      addLog(`IndexedDB cleanup: ${successCount} databases deleted, ${errorCount} failed`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addLog(`Error clearing IndexedDB: ${errorMessage}`);
    }
  };

  const handleFixTables = async () => {
    if (!user) {
      addLog('Not authenticated, cannot fix tables');
      return;
    }

    setIsFixing(true);

    try {
      addLog('Fixing buyers and sellers tables...');

      // Step 1: Check if the buyers table exists
      addLog('Checking buyers table...');

      try {
        const { error: buyersError } = await supabase.from('buyers').select('id').limit(1);

        if (buyersError && buyersError.message.includes('does not exist')) {
          // Table doesn't exist, create it
          addLog('Buyers table does not exist, creating it...');

          const createBuyersSQL = `
            CREATE TABLE IF NOT EXISTS public.buyers (
              id TEXT PRIMARY KEY,
              user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
              name TEXT NOT NULL,
              email TEXT,
              phone TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
            );

            ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

            CREATE POLICY "Users can manage their own buyers"
              ON public.buyers
              USING (user_id = auth.uid());

            GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyers TO authenticated;
          `;

          const { error: createError } = await supabase.rpc('execute_sql', { sql_query: createBuyersSQL });

          if (createError) {
            addLog(`Error creating buyers table: ${createError.message}`);
          } else {
            addLog('Successfully created buyers table');
          }
        } else if (buyersError) {
          // Some other error
          addLog(`Error checking buyers table: ${buyersError.message}`);
        } else {
          // Table exists, check if it has the created_at column
          addLog('Buyers table exists, checking for created_at column...');

          // Try to add the created_at column if it doesn't exist
          const addColumnSQL = `
            DO $$
            BEGIN
              BEGIN
                ALTER TABLE public.buyers ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL;
              EXCEPTION
                WHEN duplicate_column THEN
                  -- Column already exists, do nothing
                WHEN others THEN
                  RAISE;
              END;
            END
            $$;
          `;

          const { error: addColumnError } = await supabase.rpc('execute_sql', { sql_query: addColumnSQL });

          if (addColumnError) {
            addLog(`Error adding created_at column to buyers table: ${addColumnError.message}`);
          } else {
            addLog('Successfully ensured created_at column exists in buyers table');
          }
        }
      } catch (buyersError) {
        const errorMessage = buyersError instanceof Error ? buyersError.message : String(buyersError);
        addLog(`Unexpected error checking buyers table: ${errorMessage}`);
      }

      // Step 2: Check if the sellers table exists
      addLog('Checking sellers table...');

      try {
        const { error: sellersError } = await supabase.from('sellers').select('id').limit(1);

        if (sellersError && sellersError.message.includes('does not exist')) {
          // Table doesn't exist, create it
          addLog('Sellers table does not exist, creating it...');

          const createSellersSQL = `
            CREATE TABLE IF NOT EXISTS public.sellers (
              id TEXT PRIMARY KEY,
              user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
              name TEXT NOT NULL,
              email TEXT,
              phone TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
            );

            ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

            CREATE POLICY "Users can manage their own sellers"
              ON public.sellers
              USING (user_id = auth.uid());

            GRANT SELECT, INSERT, UPDATE, DELETE ON public.sellers TO authenticated;
          `;

          const { error: createError } = await supabase.rpc('execute_sql', { sql_query: createSellersSQL });

          if (createError) {
            addLog(`Error creating sellers table: ${createError.message}`);
          } else {
            addLog('Successfully created sellers table');
          }
        } else if (sellersError) {
          // Some other error
          addLog(`Error checking sellers table: ${sellersError.message}`);
        } else {
          // Table exists, check if it has the created_at column
          addLog('Sellers table exists, checking for created_at column...');

          // Try to add the created_at column if it doesn't exist
          const addColumnSQL = `
            DO $$
            BEGIN
              BEGIN
                ALTER TABLE public.sellers ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL;
              EXCEPTION
                WHEN duplicate_column THEN
                  -- Column already exists, do nothing
                WHEN others THEN
                  RAISE;
              END;
            END
            $$;
          `;

          const { error: addColumnError } = await supabase.rpc('execute_sql', { sql_query: addColumnSQL });

          if (addColumnError) {
            addLog(`Error adding created_at column to sellers table: ${addColumnError.message}`);
          } else {
            addLog('Successfully ensured created_at column exists in sellers table');
          }
        }
      } catch (sellersError) {
        const errorMessage = sellersError instanceof Error ? sellersError.message : String(sellersError);
        addLog(`Unexpected error checking sellers table: ${errorMessage}`);
      }

      addLog('Table fixes completed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addLog(`Error fixing tables: ${errorMessage}`);
    } finally {
      setIsFixing(false);
    }
  };

  // If not in fallback mode, don't render anything
  const urlParams = new URLSearchParams(window.location.search);
  const isFallback = urlParams.get('fallback') === 'true';

  if (!isFallback) {
    return null;
  }

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginTop: 0 }}>Application Recovery</h1>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#ef4444',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h2>1. Authentication Status</h2>
          {user ? (
            <p style={{ color: '#10b981' }}>
              ✅ Authenticated as {user.email}
            </p>
          ) : (
            <p style={{ color: '#ef4444' }}>
              ❌ Not authenticated
            </p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>2. Recovery Actions</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
            <button
              onClick={handleClearLocalStorage}
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Local Storage
            </button>

            <button
              onClick={handleClearIndexedDB}
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear IndexedDB
            </button>

            <button
              onClick={handleFixTables}
              disabled={isFixing || !user}
              style={{
                backgroundColor: user ? '#10b981' : '#d1d5db',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: user ? 'pointer' : 'not-allowed'
              }}
            >
              {isFixing ? 'Fixing Tables...' : 'Fix Database Tables'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>3. Return to Application</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href="/"
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Return to App
            </a>

            <a
              href="/login"
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Go to Login
            </a>
          </div>
        </div>

        <div>
          <h2>4. Logs</h2>
          <div
            style={{
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              maxHeight: '300px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '14px',
              whiteSpace: 'pre-wrap'
            }}
          >
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallbackApp;
