
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { dbManager } from '@/lib/db';
import { Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { CustomDatabase } from '@/types/supabase-types';

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
      const localTransactions = await dbManager.getAllTransactions();
      
      // Check if there are transactions that haven't been synced
      const unsyncedTransactions = localTransactions.filter(t => !t.syncedAt || new Date(t.syncedAt).getTime() < new Date(t.updatedAt || t.date).getTime());
      
      setIsAllSynced(unsyncedTransactions.length === 0);
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
      // Get all local transactions
      const localTransactions = await dbManager.getAllTransactions();
      
      // Upload each transaction to Supabase
      for (const transaction of localTransactions) {
        // Skip already synced transactions
        if (transaction.syncedAt && new Date(transaction.syncedAt).getTime() >= new Date(transaction.updatedAt || transaction.date).getTime()) {
          continue;
        }
        
        // Prepare transaction for upload (add user_id)
        const transactionToUpload = {
          ...transaction,
          user_id: user.id,
          syncedAt: new Date().toISOString(),
        };
        
        // Check if transaction already exists in Supabase
        const { data: existingTransaction } = await supabase
          .from<'transactions', any>('transactions')
          .select('id')
          .eq('id', transaction.id)
          .eq('user_id', user.id)
          .single();
        
        if (existingTransaction) {
          // Update existing transaction
          await supabase
            .from<'transactions', any>('transactions')
            .update(transactionToUpload)
            .eq('id', transaction.id)
            .eq('user_id', user.id);
        } else {
          // Insert new transaction
          await supabase
            .from<'transactions', any>('transactions')
            .insert(transactionToUpload);
        }
        
        // Update local transaction with synced timestamp
        await dbManager.updateTransaction({
          ...transaction,
          syncedAt: new Date().toISOString(),
        });
      }
      
      // Download transactions from Supabase that aren't in local DB
      const { data: cloudTransactions } = await supabase
        .from<'transactions', any>('transactions')
        .select('*')
        .eq('user_id', user.id);
      
      if (cloudTransactions) {
        // Find cloud transactions not in local DB
        const localIds = new Set(localTransactions.map(t => t.id));
        const newCloudTransactions = cloudTransactions.filter(t => !localIds.has(t.id));
        
        // Add new cloud transactions to local DB
        for (const transaction of newCloudTransactions) {
          await dbManager.addTransaction(transaction as unknown as Transaction);
        }
      }
      
      // Update sync status
      const now = Date.now();
      setLastSyncTime(now);
      localStorage.setItem(`lastSyncTime_${user.id}`, now.toString());
      setIsAllSynced(true);
      
      toast({
        title: "Sync successful",
        description: "All your transactions have been synced to the cloud.",
      });
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
