import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { syncService } from '@/lib/sync-service';
import { RefreshCw } from 'lucide-react';

interface ForceTransportationSyncProps {
  transactionId: string;
  onSyncComplete?: () => Promise<void>;
  className?: string;
}

const ForceTransportationSync: React.FC<ForceTransportationSyncProps> = ({ 
  transactionId,
  onSyncComplete,
  className = ''
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    if (isSyncing || !transactionId) return;

    try {
      setIsSyncing(true);
      
      // Force sync transportation
      const success = await syncService.syncTransportation(transactionId);
      
      if (success) {
        toast({
          title: 'Sync Successful',
          description: 'Transportation data has been synchronized with the cloud.',
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
      console.error('Error syncing transportation data:', error);
      toast({
        title: 'Sync Error',
        description: 'An error occurred while syncing transportation data.',
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
      {isSyncing ? 'Syncing...' : 'Sync Transportation'}
    </Button>
  );
};

export default ForceTransportationSync;
