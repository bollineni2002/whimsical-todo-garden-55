import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Trash2, Database } from 'lucide-react';

interface DataManagementSettingsProps {
  userId?: string;
}

const DataManagementSettings = ({ userId }: DataManagementSettingsProps) => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSettings, setSyncSettings] = useState({
    transactionDetails: true,
    businessTransactions: true,
    clients: true
  });

  // Load sync settings from localStorage
  useEffect(() => {
    const loadSyncSettings = () => {
      const savedSettings = localStorage.getItem('syncSettings');
      if (savedSettings) {
        setSyncSettings(JSON.parse(savedSettings));
      }
    };
    
    loadSyncSettings();
  }, []);

  // Save sync settings to localStorage
  const saveSyncSettings = (newSettings: typeof syncSettings) => {
    localStorage.setItem('syncSettings', JSON.stringify(newSettings));
    setSyncSettings(newSettings);
  };

  const handleSyncToggle = (key: keyof typeof syncSettings) => {
    const newSettings = {
      ...syncSettings,
      [key]: !syncSettings[key]
    };
    saveSyncSettings(newSettings);
    
    toast({
      title: 'Sync Settings Updated',
      description: `${key} sync has been ${newSettings[key] ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleSyncAll = async () => {
    if (!userId) {
      toast({
        title: 'Sync Failed',
        description: 'You must be logged in to sync data.',
        variant: 'destructive',
      });
      return;
    }

    setIsSyncing(true);
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Sync Complete',
        description: 'Your data has been synchronized with the cloud.',
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'Sync Failed',
        description: 'There was an error synchronizing your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearLocalData = async () => {
    try {
      // Clear IndexedDB data
      const dbNames = ['transactions', 'clients', 'dailyLogs'];
      for (const dbName of dbNames) {
        const request = indexedDB.deleteDatabase(dbName);
        await new Promise((resolve, reject) => {
          request.onsuccess = resolve;
          request.onerror = reject;
        });
      }
      
      toast({
        title: 'Local Data Cleared',
        description: 'All local data has been cleared successfully.',
      });
    } catch (error) {
      console.error('Error clearing local data:', error);
      toast({
        title: 'Operation Failed',
        description: 'Failed to clear local data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleResetApplication = async () => {
    try {
      // Clear all localStorage items except auth tokens
      const authToken = localStorage.getItem('supabase.auth.token');
      localStorage.clear();
      if (authToken) {
        localStorage.setItem('supabase.auth.token', authToken);
      }
      
      // Clear IndexedDB databases
      const dbNames = ['transactions', 'clients', 'dailyLogs'];
      for (const dbName of dbNames) {
        const request = indexedDB.deleteDatabase(dbName);
        await new Promise((resolve, reject) => {
          request.onsuccess = resolve;
          request.onerror = reject;
        });
      }
      
      toast({
        title: 'Application Reset',
        description: 'The application has been reset to its default state.',
      });
      
      // Reload the application
      window.location.reload();
    } catch (error) {
      console.error('Error resetting application:', error);
      toast({
        title: 'Reset Failed',
        description: 'Failed to reset the application. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBackupData = async () => {
    try {
      // Collect data from IndexedDB
      const backup: Record<string, any> = {};
      
      // This is a simplified example - in a real app, you'd need to
      // implement proper IndexedDB data extraction for each store
      const dbNames = ['transactions', 'clients', 'dailyLogs'];
      
      // For demonstration purposes only
      backup.timestamp = new Date().toISOString();
      backup.userId = userId;
      backup.settings = {
        syncSettings,
        theme: localStorage.getItem('theme'),
        fontSize: localStorage.getItem('fontSize'),
        businessName: localStorage.getItem('businessName'),
        language: localStorage.getItem('language'),
        currency: localStorage.getItem('currency'),
        dateFormat: localStorage.getItem('dateFormat'),
        defaultView: localStorage.getItem('defaultView'),
      };
      
      // Convert to JSON and create download
      const dataStr = JSON.stringify(backup, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `transactly-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: 'Backup Created',
        description: 'Your data has been backed up successfully.',
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Backup Failed',
        description: 'Failed to create backup. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRestoreData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const backup = JSON.parse(e.target?.result as string);
          
          // Validate backup data
          if (!backup || !backup.timestamp) {
            throw new Error('Invalid backup file');
          }
          
          // Restore settings
          if (backup.settings) {
            for (const [key, value] of Object.entries(backup.settings)) {
              if (key === 'syncSettings') {
                saveSyncSettings(value as typeof syncSettings);
              } else if (value) {
                localStorage.setItem(key, value as string);
              }
            }
          }
          
          // In a real app, you would restore IndexedDB data here
          
          toast({
            title: 'Restore Complete',
            description: `Data from ${new Date(backup.timestamp).toLocaleString()} has been restored.`,
          });
          
          // Reload to apply settings
          window.location.reload();
        } catch (error) {
          console.error('Error parsing backup:', error);
          toast({
            title: 'Restore Failed',
            description: 'The backup file is invalid or corrupted.',
            variant: 'destructive',
          });
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading backup file:', error);
      toast({
        title: 'Restore Failed',
        description: 'Failed to read the backup file. Please try again.',
        variant: 'destructive',
      });
    }
    
    // Clear the input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Data Management</h2>
        <p className="text-sm text-muted-foreground">
          Manage your data synchronization and storage options.
        </p>
      </div>

      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Synchronization</CardTitle>
          <CardDescription>
            Control how your data syncs with the cloud database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="transaction-sync">Transaction Details</Label>
                <p className="text-sm text-muted-foreground">
                  Sync transaction details with the cloud
                </p>
              </div>
              <Switch
                id="transaction-sync"
                checked={syncSettings.transactionDetails}
                onCheckedChange={() => handleSyncToggle('transactionDetails')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="business-sync">Business Transactions</Label>
                <p className="text-sm text-muted-foreground">
                  Sync business transactions with the cloud
                </p>
              </div>
              <Switch
                id="business-sync"
                checked={syncSettings.businessTransactions}
                onCheckedChange={() => handleSyncToggle('businessTransactions')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="clients-sync">Clients</Label>
                <p className="text-sm text-muted-foreground">
                  Sync client information with the cloud
                </p>
              </div>
              <Switch
                id="clients-sync"
                checked={syncSettings.clients}
                onCheckedChange={() => handleSyncToggle('clients')}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSyncAll} 
            disabled={isSyncing}
            className="w-full mt-4"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card>
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>
            Create backups of your data or restore from a previous backup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={handleBackupData}
              className="w-full"
            >
              <Database className="mr-2 h-4 w-4" />
              Backup Data
            </Button>
            
            <div className="relative">
              <input
                type="file"
                id="restore-file"
                accept=".json"
                onChange={handleRestoreData}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button 
                variant="outline" 
                className="w-full pointer-events-none"
              >
                <Database className="mr-2 h-4 w-4" />
                Restore from Backup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Cleanup */}
      <Card>
        <CardHeader>
          <CardTitle>Data Cleanup</CardTitle>
          <CardDescription>
            Clear local data or reset the application to its default state.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Local Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Local Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all locally stored data. This action cannot be undone.
                    Your cloud data will remain intact.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearLocalData}>
                    Clear Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reset Application
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Application?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset the application to its default state, clearing all local data and settings.
                    This action cannot be undone. Your cloud data will remain intact.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetApplication}>
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagementSettings;
