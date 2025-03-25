
import { useState, useCallback, useEffect } from 'react';
import { TabKey, Transaction } from '@/lib/types';
import TabNavigation from './TabNavigation';
import TabContent from './TabContent';
import { dbManager } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface DetailedViewProps {
  transaction: Transaction;
  refreshTransaction?: () => Promise<void>; // Added refreshTransaction as an optional prop
}

const DetailedView = ({ transaction, refreshTransaction: externalRefresh }: DetailedViewProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('loadBuy');
  const [currentTransaction, setCurrentTransaction] = useState<Transaction>(transaction);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const internalRefreshTransaction = useCallback(async () => {
    try {
      const refreshedTransaction = await dbManager.getTransaction(transaction.id);
      if (refreshedTransaction) {
        setCurrentTransaction(refreshedTransaction);
      }
    } catch (error) {
      console.error("Error refreshing transaction:", error);
    }
  }, [transaction.id]);

  // Use external refresh if provided, otherwise use internal refresh
  const refreshTransaction = externalRefresh || internalRefreshTransaction;

  // Check if the transaction should be marked as completed based on payments
  useEffect(() => {
    const checkTransactionStatus = async () => {
      // Only proceed if there's both load buy and load sold data
      if (currentTransaction.loadBuy && currentTransaction.loadSold) {
        const { amountPaid, totalCost } = currentTransaction.loadBuy;
        const { amountReceived, totalSaleAmount } = currentTransaction.loadSold;
        
        // If amounts paid and received match the total costs, mark as completed
        if (
          amountPaid >= totalCost && 
          amountReceived >= totalSaleAmount &&
          currentTransaction.status !== 'completed'
        ) {
          const updatedTransaction = {
            ...currentTransaction,
            status: 'completed' as const
          };
          
          await dbManager.updateTransaction(updatedTransaction);
          await refreshTransaction();
          
          toast({
            title: "Status Updated",
            description: "Transaction has been marked as completed automatically.",
          });
        }
      }
    };
    
    checkTransactionStatus();
  }, [currentTransaction, refreshTransaction, toast]);

  const handleDelete = async () => {
    try {
      await dbManager.deleteTransaction(currentTransaction.id);
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
      navigate('/');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="w-full md:w-1/4 min-w-[240px] flex-shrink-0 border-b md:border-b-0 border-border">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        <div className="flex-1 overflow-auto">
          <TabContent 
            transaction={currentTransaction} 
            activeTab={activeTab} 
            refreshTransaction={refreshTransaction} 
          />
        </div>
      </div>

      {/* Transaction deletion section - now separate at the bottom */}
      <div className="mt-6 border-t pt-4 px-6 pb-6">
        <h3 className="text-lg font-medium mb-4">Transaction Management</h3>
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
            </DialogHeader>
            <p className="py-4">This action cannot be undone. This will permanently delete this transaction and all its data.</p>
            <DialogFooter className="flex space-x-2 justify-end">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DetailedView;
