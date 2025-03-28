
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { dbManager } from '@/lib/db';
import { Transaction } from '@/lib/types';
import { generateId } from '@/lib/utils';
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
      const name = newTransactionName.trim() || `Transaction ${new Date().toLocaleDateString()}`;
      const newTransaction: Transaction = {
        id: generateId('txn'),
        name: name,
        date: new Date().toISOString(),
        totalAmount: 0,
        status: 'pending',
        payments: [],
        notes: [],
        attachments: [],
        user_id: user?.id // Associate with the current user
      };

      await dbManager.addTransaction(newTransaction);
      setNewTransactionName('');
      
      toast({
        title: 'Success',
        description: 'Transaction created successfully',
      });
      
      if (onTransactionCreated) {
        onTransactionCreated();
      }
      
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
