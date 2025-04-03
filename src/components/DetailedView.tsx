import { useState, useCallback, useEffect } from 'react';
import { TabKey, Transaction } from '@/lib/types';
import TabNavigation from './TabNavigation';
import TabContent, { ExtendedTabKey } from './TabContent';
import { dbManager } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Trash2, MoreVertical } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface DetailedViewProps {
  transaction: Transaction;
  refreshTransaction?: () => Promise<void>;
}

const DetailedView = ({ transaction, refreshTransaction: externalRefresh }: DetailedViewProps) => {
  // Use the first tab as the default active tab
  const [activeTab, setActiveTab] = useState<TabKey | ExtendedTabKey>(TabKey.LOAD_BUY);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction>(transaction);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

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
            status: 'completed' as const,
            updatedAt: new Date().toISOString(),
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
      {/* Transaction action header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium">
          {currentTransaction.name}
          <span className={`ml-2 text-sm px-2 py-0.5 rounded-full ${
            currentTransaction.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
            currentTransaction.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
          }`}>
            {currentTransaction.status.charAt(0).toUpperCase() + currentTransaction.status.slice(1)}
          </span>
        </h2>

        {/* Actions: More Options Dropdown on Mobile, Button on Desktop */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Transaction
                  </DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Transaction
              </Button>
            </DialogTrigger>
          )}
          {/* Shared Dialog Content */}
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

      {/* Horizontal Tab Navigation */}
      <div className={`w-full border-b border-border ${isMobile ? 'px-2 py-1' : ''}`}>
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          disabledTabs={[]} 
          isMobile={isMobile} // Pass isMobile prop
        />
      </div>
        
      {/* Tab Content */}
      <div className={`flex-1 overflow-auto ${isMobile ? 'p-2' : 'px-4'}`}>
        <TabContent 
          transaction={currentTransaction} 
          activeTab={activeTab} 
          refreshTransaction={refreshTransaction} 
        />
      </div>
    </div>
  );
};

export default DetailedView;
