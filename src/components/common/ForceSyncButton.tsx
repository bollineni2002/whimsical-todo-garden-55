import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { syncService } from '@/lib/sync-service';
import { RefreshCw } from 'lucide-react';

interface ForceSyncButtonProps {
  onSyncComplete?: () => Promise<void>;
  className?: string;
}

const ForceSyncButton: React.FC<ForceSyncButtonProps> = ({ 
  onSyncComplete,
  className = ''
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSync = async () => {
    if (!user?.id || isSyncing) return;

    try {
      setIsSyncing(true);
      
      // Force sync contacts and logs
      const success = await syncService.forceSyncContacts(user.id);
      
      if (success) {
        toast({
          title: 'Sync Successful',
          description: 'Your data has been synchronized with the cloud.',
        });
      } else {
        toast({
          title: 'Sync Failed',
          description: 'Please check your internet connection and try again.',
          variant: 'destructive',
        });
      }
      
      // Call the onSyncComplete callback if provided
      if (onSyncComplete) {
        await onSyncComplete();
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      toast({
        title: 'Sync Error',
        description: 'An error occurred while syncing your data.',
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
      {isSyncing ? 'Syncing...' : 'Force Sync'}
    </Button>
  );
};

export default ForceSyncButton;
