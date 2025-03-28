
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface TransactionFormProps {
  onTransactionCreated?: () => void;
}

// Define the form schema
const formSchema = z.object({
  transactionName: z.string().min(1, "Transaction name is required"),
  businessName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TransactionForm = ({ onTransactionCreated }: TransactionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionName: '',
      businessName: '',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // Create a new transaction with the user_id
      const newTransaction: Transaction = {
        id: generateId('txn'),
        name: values.transactionName,
        date: new Date().toISOString(),
        totalAmount: 0, // Will be calculated based on further details
        status: 'pending',
        loadBuy: undefined, // Will be added in the detailed view
        transportation: undefined, // Will be added in the detailed view
        loadSold: undefined, // Will be added in the detailed view
        payments: [],
        notes: [],
        attachments: [],
        businessName: values.businessName || undefined,
        updatedAt: new Date().toISOString(),
        user_id: user?.id // Associate with the current user
      };

      await dbManager.addTransaction(newTransaction);
      
      form.reset();
      
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="transactionName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter transaction name" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter business name" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Transaction"}
        </Button>
      </form>
    </Form>
  );
};

export default TransactionForm;
