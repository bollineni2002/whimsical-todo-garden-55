
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabaseSimple as supabase } from '@/integrations/supabase/simple-client';
import { dbManager } from '@/lib/db';
import { Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { CustomDatabase } from '@/types/supabase-types';

// Define a type for transactions in Supabase
type SupabaseTransaction = Transaction & { user_id: string };

export const useSyncStatus = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAllSynced, setIsAllSynced] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Function to check if online
  const isOnline = () => {
    return navigator.onLine;
  };

  // Load last sync time from localStorage
  useEffect(() => {
    if (user) {
      const storedLastSyncTime = localStorage.getItem(`lastSyncTime_${user.id}`);
      if (storedLastSyncTime) {
        setLastSyncTime(parseInt(storedLastSyncTime, 10));
      }

      // Check if there are any unsaved changes
      checkUnsyncedChanges();
    }
  }, [user]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (!isAllSynced) {
        // Auto-sync when coming back online
        sync();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', () => checkUnsyncedChanges());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', () => checkUnsyncedChanges());
    };
  }, [isAllSynced]);

  // Check for unsaved changes
  const checkUnsyncedChanges = useCallback(async () => {
    if (!user) return;

    try {
      // Check transactions
      const localTransactions = await dbManager.getAllTransactions();
      const unsyncedTransactions = localTransactions.filter(t => !t.syncedAt || new Date(t.syncedAt).getTime() < new Date(t.updatedAt || t.date).getTime());

      // Import needed services for buyers/sellers check
      const { dbService } = await import('@/lib/db-service');
      const { syncService } = await import('@/lib/sync-service');

      // Check buyers and sellers
      let hasUnsyncedBuyersOrSellers = false;

      try {
        // Get sync status from syncService
        const syncStatus = await syncService.getSyncStatus();
        if (!syncStatus.isAllSynced) {
          hasUnsyncedBuyersOrSellers = true;
        }
      } catch (syncStatusError) {
        console.error('Error checking sync status:', syncStatusError);
        hasUnsyncedBuyersOrSellers = true; // Assume there are unsynced changes if we can't check
      }

      setIsAllSynced(unsyncedTransactions.length === 0 && !hasUnsyncedBuyersOrSellers);
    } catch (error) {
      console.error('Error checking unsynced changes:', error);
      setIsAllSynced(false);
    }
  }, [user]);

  // Sync function
  const sync = useCallback(async () => {
    if (!user || !isOnline()) {
      toast({
        title: "Sync failed",
        description: "You are offline. Please connect to the internet and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);

    try {
      // Import syncService for comprehensive sync
      const { syncService } = await import('@/lib/sync-service');

      // Use syncAll to sync all data types including buyers and sellers
      const syncSuccess = await syncService.syncAll(user.id);

      if (syncSuccess) {
        // Update sync status
        const now = Date.now();
        setLastSyncTime(now);
        localStorage.setItem(`lastSyncTime_${user.id}`, now.toString());
        setIsAllSynced(true);

        toast({
          title: "Sync successful",
          description: "All your data has been synced to the cloud.",
        });
      } else {
        setIsAllSynced(false);
        toast({
          title: "Sync partially failed",
          description: "Some of your data may not have been synced. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      setIsAllSynced(false);
      toast({
        title: "Sync failed",
        description: "There was an error syncing your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [user, toast]);

  return { isSyncing, isAllSynced, lastSyncTime, sync, checkUnsyncedChanges };
};
