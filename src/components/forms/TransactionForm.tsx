import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Transaction } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { dbManager } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';

interface TransactionFormProps {
  onTransactionCreated?: () => void;
}

const TransactionForm = ({ onTransactionCreated }: TransactionFormProps) => {
  const [transactionName, setTransactionName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a new transaction with the user_id
      const newTransaction: Transaction = {
        id: generateId('txn'),
        name: transactionName,
        date: new Date().toISOString(),
        totalAmount: 0, // Will be calculated based on further details
        status: 'pending',
        loadBuy: undefined, // Will be added in the detailed view
        transportation: undefined, // Will be added in the detailed view
        loadSold: undefined, // Will be added in the detailed view
        payments: [],
        notes: [],
        attachments: [],
        businessName: businessName,
        updatedAt: new Date().toISOString(),
        user_id: user?.id // Associate with the current user
      };

      await dbManager.addTransaction(newTransaction);
      
      setTransactionName('');
      setBusinessName('');
      
      toast({
        title: "Transaction Created",
        description: "Your new transaction has been created successfully.",
      });
      
      if (onTransactionCreated) {
        onTransactionCreated();
      }
      
      // Redirect to the transaction detail page
      navigate(`/transaction/${newTransaction.id}`);
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to create transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter transaction name" 
                  value={transactionName}
                  onChange={(e) => setTransactionName(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          name="transactionName"
          render={() => null}
        />
        <FormField
          control={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter business name" 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          name="businessName"
          render={() => null}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Transaction"}
        </Button>
      </form>
    </Form>
  );
};

export default TransactionForm;
