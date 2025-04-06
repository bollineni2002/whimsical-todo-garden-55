import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Database } from 'lucide-react';

const CheckSupabaseConnection: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unchecked' | 'success' | 'error'>('unchecked');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tableStatus, setTableStatus] = useState<Record<string, boolean>>({});

  const checkConnection = async () => {
    setIsChecking(true);
    setConnectionStatus('unchecked');
    setErrorMessage(null);
    setTableStatus({});

    try {
      // Import the Supabase client directly
      const { supabaseSimple } = await import('@/integrations/supabase/simple-client');
      
      // Test basic connection
      const { error: connectionError } = await supabaseSimple
        .from('_fake_table_for_connection_test')
        .select('*')
        .limit(1)
        .catch(() => ({ error: { message: 'Connection test failed' } }));
      
      if (connectionError && !connectionError.message.includes('does not exist')) {
        setConnectionStatus('error');
        setErrorMessage(`Connection error: ${connectionError.message}`);
        return;
      }
      
      // Connection successful, now check tables
      const tablesToCheck = ['buyers', 'sellers', 'transactions', 'users'];
      const tableResults: Record<string, boolean> = {};
      
      for (const table of tablesToCheck) {
        try {
          const { error: tableError } = await supabaseSimple
            .from(table)
            .select('count')
            .limit(1);
            
          tableResults[table] = !tableError || !tableError.message.includes('does not exist');
        } catch (e) {
          tableResults[table] = false;
        }
      }
      
      setTableStatus(tableResults);
      setConnectionStatus('success');
      
      // Check if any tables are missing
      const missingTables = Object.entries(tableResults)
        .filter(([_, exists]) => !exists)
        .map(([table]) => table);
        
      if (missingTables.length > 0) {
        setErrorMessage(`Connected, but missing tables: ${missingTables.join(', ')}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(`Error: ${(error as Error).message}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">Supabase Connection Status</h3>
      
      <div className="flex items-center mb-4">
        {connectionStatus === 'unchecked' ? (
          <Database className="h-8 w-8 text-gray-400" />
        ) : connectionStatus === 'success' ? (
          <CheckCircle className="h-8 w-8 text-green-500" />
        ) : (
          <AlertCircle className="h-8 w-8 text-red-500" />
        )}
        
        <span className="ml-2">
          {connectionStatus === 'unchecked' 
            ? 'Connection not checked' 
            : connectionStatus === 'success' 
              ? 'Connected to Supabase' 
              : 'Connection error'}
        </span>
      </div>
      
      {errorMessage && (
        <div className="text-red-500 mb-4 text-sm">
          {errorMessage}
        </div>
      )}
      
      {Object.keys(tableStatus).length > 0 && (
        <div className="mb-4 w-full">
          <h4 className="text-sm font-medium mb-2">Table Status:</h4>
          <ul className="text-sm">
            {Object.entries(tableStatus).map(([table, exists]) => (
              <li key={table} className="flex items-center">
                {exists ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                {table}: {exists ? 'Exists' : 'Missing'}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <Button 
        onClick={checkConnection} 
        disabled={isChecking}
        variant="outline"
        size="sm"
      >
        {isChecking ? 'Checking...' : 'Check Connection'}
      </Button>
    </div>
  );
};

export default CheckSupabaseConnection;
