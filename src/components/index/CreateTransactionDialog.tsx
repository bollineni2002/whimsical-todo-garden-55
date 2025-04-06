
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { transactionService } from '@/lib/transaction-service';
import { useAuth } from '@/context/AuthContext';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateTransactionDialogProps {
  onTransactionCreated: () => void;
}

const CreateTransactionDialog = ({ onTransactionCreated }: CreateTransactionDialogProps) => {
  const [newTransactionName, setNewTransactionName] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreateTransaction = async () => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const name = newTransactionName.trim() || `Transaction ${new Date().toLocaleDateString()}`;
      console.log(`Attempting to create transaction with name: ${name}`);

      // Create transaction using the transaction service
      // The service now checks for duplicates internally
      const newTransaction = await transactionService.createTransaction(user.id, name);

      if (!newTransaction) {
        throw new Error('Failed to create transaction');
      }

      console.log(`Transaction created/retrieved with ID: ${newTransaction.id}`);
      setNewTransactionName('');

      toast({
        title: 'Success',
        description: 'Transaction created successfully',
      });

      if (onTransactionCreated) {
        console.log('Calling onTransactionCreated callback to refresh transaction list');
        onTransactionCreated();
      }

      // Navigate to the transaction details page
      console.log(`Navigating to transaction details: /transaction/${newTransaction.id}`);
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
        <Button variant="outline" onClick={() => onTransactionCreated()}>Cancel</Button>
        <Button onClick={handleCreateTransaction}>Create</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default CreateTransactionDialog;
