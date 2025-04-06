
import { useState, useCallback, useEffect } from 'react';
import { TabKey, CompleteTransaction } from '@/lib/types';
import TabNavigation from './TabNavigation';
import TabContent, { ExtendedTabKey } from './TabContent';
import { transactionService } from '@/lib/transaction-service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Trash2, MoreVertical } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface DetailedViewProps {
  transaction: CompleteTransaction;
  refreshTransaction?: () => Promise<void>;
}

const DetailedView = ({ transaction, refreshTransaction: externalRefresh }: DetailedViewProps) => {
  // Get the active tab from localStorage or use the first tab as default
  const [activeTab, setActiveTab] = useState<TabKey | ExtendedTabKey>(() => {
    const savedTab = localStorage.getItem(`transaction_${transaction.transaction.id}_activeTab`);
    return savedTab ? (savedTab as TabKey | ExtendedTabKey) : TabKey.PURCHASES;
  });
  const [currentTransaction, setCurrentTransaction] = useState<CompleteTransaction>(transaction);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Update currentTransaction when transaction prop changes
  useEffect(() => {
    setCurrentTransaction(transaction);
  }, [transaction]);

  // Save active tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`transaction_${transaction.transaction.id}_activeTab`, activeTab);
  }, [activeTab, transaction.transaction.id]);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const internalRefreshTransaction = useCallback(async () => {
    try {
      const refreshedTransaction = await transactionService.getCompleteTransaction(transaction.transaction.id);
      if (refreshedTransaction) {
        setCurrentTransaction(refreshedTransaction);
      }
    } catch (error) {
      console.error("Error refreshing transaction:", error);
    }
  }, [transaction.transaction.id]);

  // Wrap the refresh function to preserve the active tab
  const refreshTransaction = async () => {
    // Store the current active tab
    const currentActiveTab = activeTab;

    // Call the external refresh if provided, otherwise use internal refresh
    if (externalRefresh) {
      await externalRefresh();
    } else {
      await internalRefreshTransaction();
    }

    // Restore the active tab after refresh
    // Get the saved tab from localStorage in case it was updated during the refresh
    const savedTab = localStorage.getItem(`transaction_${transaction.transaction.id}_activeTab`);
    if (savedTab) {
      setActiveTab(savedTab as TabKey | ExtendedTabKey);
    } else {
      setActiveTab(currentActiveTab);
    }
  };

  // Check if the transaction should be marked as completed based on payments
  useEffect(() => {
    const checkTransactionStatus = async () => {
      // Only proceed if there are purchases and sales
      if (currentTransaction.purchases.length > 0 && currentTransaction.sales.length > 0) {
        // Calculate total amounts
        const totalPurchaseCost = currentTransaction.purchases.reduce((sum, purchase) => sum + purchase.total_cost, 0);
        const totalPurchasePaid = currentTransaction.purchases.reduce((sum, purchase) => sum + purchase.amount_paid, 0);

        const totalSaleAmount = currentTransaction.sales.reduce((sum, sale) => sum + sale.total_amount, 0);
        const totalSaleReceived = currentTransaction.sales.reduce((sum, sale) => sum + sale.amount_received, 0);

        // If amounts paid and received match the total costs, mark as completed
        if (
          totalPurchasePaid >= totalPurchaseCost &&
          totalSaleReceived >= totalSaleAmount &&
          currentTransaction.transaction.status !== 'completed'
        ) {
          const updatedTransaction = {
            ...currentTransaction.transaction,
            status: 'completed' as const,
          };

          await transactionService.updateTransaction(updatedTransaction);
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
      await transactionService.deleteTransaction(currentTransaction.transaction.id);
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
      <div className="p-4 border-b flex justify-between items-center bg-background text-foreground">
        <h2 className="text-lg font-medium">
          {currentTransaction.transaction.name}
          <span className={`ml-2 text-sm px-2 py-0.5 rounded-full ${
            currentTransaction.transaction.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
            currentTransaction.transaction.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
          }`}>
            {currentTransaction.transaction.status.charAt(0).toUpperCase() + currentTransaction.transaction.status.slice(1)}
          </span>
        </h2>

        {/* Actions: More Options Dropdown on Mobile, Button on Desktop */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border border-border text-foreground">
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
          <DialogContent className="bg-background border border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
            </DialogHeader>
            <p className="py-4">This action cannot be undone. This will permanently delete this transaction and all its data.</p>
            <DialogFooter className="flex space-x-2 justify-end">
              <DialogClose asChild>
                <Button variant="outline" className="bg-background hover:bg-secondary border border-border text-foreground">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Horizontal Tab Navigation */}
      <div className={`w-full border-b border-border bg-background ${isMobile ? 'px-2 py-1' : ''}`}>
        <TabNavigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            // Save to localStorage immediately
            localStorage.setItem(`transaction_${transaction.transaction.id}_activeTab`, tab);
          }}
          disabledTabs={[]}
          isMobile={isMobile}
        />
      </div>

      {/* Tab Content */}
      <div className={`flex-1 overflow-auto bg-background ${isMobile ? 'p-2' : 'px-4'}`}>
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
