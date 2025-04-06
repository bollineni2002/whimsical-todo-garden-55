import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { syncService } from '@/lib/sync-service';
import { dbService } from '@/lib/db-service';
import { supabaseService } from '@/lib/supabase-service';
import { RefreshCw } from 'lucide-react';

interface ForceBuyerSellerSyncProps {
  type: 'buyers' | 'sellers';
  onSyncComplete?: () => Promise<void>;
  className?: string;
}

const ForceBuyerSellerSync: React.FC<ForceBuyerSellerSyncProps> = ({
  type,
  onSyncComplete,
  className = ''
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSync = async () => {
    console.log('FORCE-SYNC: handleSync called for', type);
    if (!user?.id || isSyncing) {
      console.log('FORCE-SYNC: No user ID or already syncing, returning');
      return;
    }

    try {
      setIsSyncing(true);
      console.log(`FORCE-SYNC: Starting force sync of ${type} for user ${user.id}...`);

      // First, check if the table exists in Supabase
      console.log(`Checking if ${type} table exists in Supabase...`);

      // Get local data first
      let localData = [];
      if (type === 'buyers') {
        localData = await dbService.getBuyersByUser(user.id);
      } else {
        localData = await dbService.getSellersByUser(user.id);
      }

      console.log(`Found ${localData.length} local ${type}`);

      // First try using the forceSyncContacts method which has more robust error handling
      let forceSyncSuccess = false;
      try {
        console.log(`Using forceSyncContacts to sync ${type}...`);
        forceSyncSuccess = await syncService.forceSyncContacts(user.id);
        console.log(`forceSyncContacts result: ${forceSyncSuccess}`);
      } catch (forceSyncError) {
        console.error(`Error in forceSyncContacts for ${type}:`, forceSyncError);
      }

      // If forceSyncContacts didn't work, try direct inserts
      if (!forceSyncSuccess) {
        console.log(`Falling back to direct inserts for ${type}...`);
        // Try to directly insert each item using the RPC function
        let successCount = 0;
        let failureCount = 0;

        for (const item of localData) {
          try {
            let result = null;

            if (type === 'buyers') {
              console.log(`Syncing buyer ${item.id} (${item.name}) to Supabase...`);
              result = await supabaseService.createBuyer(item);
            } else {
              console.log(`Syncing seller ${item.id} (${item.name}) to Supabase...`);
              result = await supabaseService.createSeller(item);
            }

            if (result) {
              console.log(`Successfully synced ${type.slice(0, -1)} ${item.id}`);
              successCount++;
            } else {
              console.log(`Failed to sync ${type.slice(0, -1)} ${item.id}`);
              failureCount++;
            }
          } catch (itemError) {
            console.error(`Error syncing ${type.slice(0, -1)} ${item.id}:`, itemError);
            failureCount++;
          }
        }

        // Also try the regular sync method
        let syncSuccess = false;
        try {
          if (type === 'buyers') {
            console.log('Forcing sync of buyers using syncBuyers...');
            syncSuccess = await syncService.syncBuyers(user.id);
          } else {
            console.log('Forcing sync of sellers using syncSellers...');
            syncSuccess = await syncService.syncSellers(user.id);
          }
        } catch (syncError) {
          console.error(`Error in regular sync of ${type}:`, syncError);
        }

        // Show appropriate toast based on results
        if (successCount > 0 || syncSuccess) {
          toast({
            title: 'Sync Successful',
            description: `${successCount} ${type} have been synchronized with the cloud.${failureCount > 0 ? ` (${failureCount} failed)` : ''}`,
          });
        } else if (failureCount > 0) {
          toast({
            title: 'Sync Partially Failed',
            description: `Failed to sync ${failureCount} ${type}. Please check the console for details.`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Sync Failed',
            description: 'Please check your internet connection and try again.',
            variant: 'destructive',
          });
        }
      } else {
        // forceSyncContacts was successful
        toast({
          title: 'Sync Successful',
          description: `Your ${type} have been synchronized with the cloud.`,
        });
      }

      // Call the onSyncComplete callback if provided
      if (onSyncComplete) {
        await onSyncComplete();
      }
    } catch (error) {
      console.error(`Error syncing ${type}:`, error);
      toast({
        title: 'Sync Error',
        description: `An error occurred while syncing your ${type}.`,
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing || !navigator.onLine}
      className={className}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : `Sync ${type.charAt(0).toUpperCase() + type.slice(1)}`}
    </Button>
  );
};

export default ForceBuyerSellerSync;
