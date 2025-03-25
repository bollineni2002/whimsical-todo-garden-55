
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { dbManager } from '@/lib/db';
import { Transaction } from '@/lib/types';
import { generateId } from '@/lib/utils';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ButtonIcon from '@/components/ui/ButtonIcon';

const CreateTransactionDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTransactionName, setNewTransactionName] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateTransaction = async () => {
    try {
      const name = newTransactionName.trim() || `Transaction ${new Date().toLocaleDateString()}`;
      const newTransaction: Transaction = {
        id: 'txn-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        name: name,
        date: new Date().toISOString(),
        totalAmount: 0,
        status: 'pending',
        payments: [],
        notes: [],
        attachments: [],
      };

      await dbManager.addTransaction(newTransaction);
      setIsDialogOpen(false);
      setNewTransactionName('');
      
      toast({
        title: 'Success',
        description: 'Transaction created successfully',
      });
      
      navigate(`/transaction/${newTransaction.id}`);
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to create transaction',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <ButtonIcon variant="default" className="rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </ButtonIcon>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="transactionName">Transaction Name</Label>
            <Input
              id="transactionName"
              placeholder="Enter a name for this transaction"
              value={newTransactionName}
              onChange={(e) => setNewTransactionName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTransaction}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTransactionDialog;
