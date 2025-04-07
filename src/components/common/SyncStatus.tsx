import { useEffect, useState } from 'react';
import { syncService } from '@/lib/sync-service';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, CheckCircle, WifiOff, AlertCircle, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SyncStatusProps {
  className?: string;
}

const SyncStatus = ({ className = '' }: SyncStatusProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSynced, setIsSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check sync status
  useEffect(() => {
    const checkSyncStatus = async () => {
      try {
        const status = await syncService.getSyncStatus();
        setIsSynced(status.isAllSynced);

        // Get last sync time from localStorage
        const lastSync = localStorage.getItem('lastSyncTime');
        if (lastSync) {
          setLastSyncTime(new Date(lastSync));
        }
      } catch (error) {
        console.error('Error checking sync status:', error);
        setIsSynced(false);
      }
    };

    checkSyncStatus();

    // Check sync status every 30 seconds
    const interval = setInterval(checkSyncStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  // Sync when coming online
  useEffect(() => {
    const syncData = async () => {
      if (isOnline && user?.id && !isSynced) {
        try {
          setIsSyncing(true);
          console.log('Automatically syncing all data after coming online...');

          // Sync all data including buyers and sellers
          const syncSuccess = await syncService.syncAll(user.id);

          // Also specifically sync buyers and sellers to ensure they're up to date
          await syncService.syncBuyers(user.id);
          await syncService.syncSellers(user.id);

          setIsSynced(true);
          const now = new Date();
          setLastSyncTime(now);
          localStorage.setItem('lastSyncTime', now.toISOString());

          console.log('Automatic sync completed');
        } catch (error) {
          console.error('Error syncing data:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    syncData();
  }, [isOnline, user, isSynced]);

  // Handle manual sync
  const handleSync = async () => {
    if (!isOnline || !user?.id || isSyncing) return;

    try {
      setIsSyncing(true);
      console.log('Manually syncing all data...');

      // Sync all data including buyers and sellers
      const syncSuccess = await syncService.syncAll(user.id);

      // Also specifically sync buyers and sellers to ensure they're up to date
      await syncService.syncBuyers(user.id);
      await syncService.syncSellers(user.id);

      setIsSynced(true);
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('lastSyncTime', now.toISOString());

      toast({
        title: 'Sync Complete',
        description: 'All data has been synchronized with the cloud',
      });

      console.log('Manual sync completed');
    } catch (error) {
      console.error('Error syncing data:', error);
      toast({
        title: 'Sync Failed',
        description: 'There was an error syncing your data',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle cleanup of duplicate transactions
  const handleCleanupDuplicates = async () => {
    if (!isOnline || !user?.id || isSyncing) return;

    try {
      setIsSyncing(true);
      toast({
        title: 'Cleaning up duplicates',
        description: 'This may take a moment...',
      });

      const result = await syncService.cleanupDuplicateTransactions(user.id);

      if (result) {
        toast({
          title: 'Cleanup Complete',
          description: 'Duplicate transactions have been removed',
        });

        // Refresh data after cleanup
        await syncService.syncTransactions(user.id);
        setIsSynced(true);
        const now = new Date();
        setLastSyncTime(now);
        localStorage.setItem('lastSyncTime', now.toISOString());
      } else {
        toast({
          title: 'Cleanup Failed',
          description: 'Failed to clean up duplicate transactions',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
      toast({
        title: 'Cleanup Failed',
        description: 'There was an error cleaning up duplicate transactions',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isOnline ? (
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  {isSyncing ? (
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-yellow-500" disabled>
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      <span className="text-xs">Syncing...</span>
                    </Button>
                  ) : isSynced ? (
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-green-500">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Synced</span>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-500">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      <span className="text-xs">Sync Now</span>
                    </Button>
                  )}
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p><strong>Sync Status:</strong> {isOnline ? (isSyncing ? 'Syncing...' : (isSynced ? 'Synced' : 'Not synced')) : 'Offline'}</p>
                  {lastSyncTime && (
                    <p><strong>Last Synced:</strong> {lastSyncTime.toLocaleString()}</p>
                  )}
                  <p className="text-xs mt-1">Click for sync options</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSync} disabled={isSyncing}>
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>Sync All Data</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCleanupDuplicates} disabled={isSyncing}>
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Clean Up Duplicates</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500" disabled>
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-xs">Offline</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p><strong>Sync Status:</strong> Offline</p>
                {lastSyncTime && (
                  <p><strong>Last Synced:</strong> {lastSyncTime.toLocaleString()}</p>
                )}
                <p className="text-xs mt-1">Connect to internet to sync</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default SyncStatus;
