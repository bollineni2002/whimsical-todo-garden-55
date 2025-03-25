
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Form } from '@/components/ui/form';
import { generateId } from '@/lib/utils';
import { dbManager } from '@/lib/db';
import { Transaction } from '@/lib/types';
import { TransactionBasicFields } from './TransactionBasicFields';
import { TransactionSupplierFields } from './TransactionSupplierFields';
import { TransactionGoodsFields } from './TransactionGoodsFields';
import { TransactionStatusField } from './TransactionStatusField';

const TransactionForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      name: '',
      supplierName: '',
      supplierContact: '',
      goodsName: '',
      quantity: '',
      purchaseRate: '',
      status: 'pending',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const purchaseRate = parseFloat(data.purchaseRate) || 0;
      const quantity = parseFloat(data.quantity) || 0;
      const totalCost = purchaseRate * quantity;
      
      // Create a fully initialized transaction object to prevent blank screens
      const newTransaction: Transaction = {
        id: generateId('txn'),
        name: data.name || `Transaction ${generateId('').slice(0, 5)}`,
        date: new Date().toISOString(),
        totalAmount: totalCost,
        status: data.status as 'completed' | 'pending' | 'cancelled',
        // Initialize loadBuy with all required properties
        loadBuy: {
          supplierName: data.supplierName,
          supplierContact: data.supplierContact,
          goodsName: data.goodsName,
          quantity: quantity,
          purchaseRate: purchaseRate,
          totalCost: totalCost,
          amountPaid: 0,
          balance: totalCost,
        },
        // Initialize empty arrays for collections
        payments: [],
        notes: [],
        attachments: [],
      };

      await dbManager.addTransaction(newTransaction);
      
      toast({
        title: "Success!",
        description: "Transaction created successfully.",
      });
      
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <TransactionBasicFields control={form.control} />
          <TransactionSupplierFields control={form.control} />
          <TransactionGoodsFields control={form.control} />
          <TransactionStatusField control={form.control} />
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            type="button"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Transaction"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransactionForm;
