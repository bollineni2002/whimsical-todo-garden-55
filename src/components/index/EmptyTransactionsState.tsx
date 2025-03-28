
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import CreateTransactionDialog from '@/components/index/CreateTransactionDialog';

interface EmptyTransactionsStateProps {
  onTransactionCreated: () => void;
}

const EmptyTransactionsState: React.FC<EmptyTransactionsStateProps> = ({ 
  onTransactionCreated 
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-muted/30 p-8 rounded-full mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-medium mb-2">No transactions yet</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Create your first transaction to start tracking your business deals efficiently.
      </p>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Your First Transaction
          </Button>
        </DialogTrigger>
        <CreateTransactionDialog 
          onTransactionCreated={() => {
            onTransactionCreated();
            setIsDialogOpen(false);
          }} 
        />
      </Dialog>
    </div>
  );
};

export default EmptyTransactionsState;
