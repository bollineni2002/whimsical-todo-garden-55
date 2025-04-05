import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Buyer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface BuyerFormProps {
  onSubmit?: (buyer: Buyer) => void;
  onCancel?: () => void;
  onSuccess?: () => void;
  defaultValues?: Partial<Buyer>;
}

const buyerSchema = z.object({
  name: z.string().min(1, { message: 'Buyer name is required' }),
  contact: z.string().min(1, { message: 'Contact information is required' }),
  quantitySold: z.coerce.number().positive({ message: 'Quantity must be positive' }),
  saleRate: z.coerce.number().positive({ message: 'Sale rate must be positive' }),
  totalSaleAmount: z.coerce.number().positive({ message: 'Total sale amount must be positive' }),
  amountReceived: z.coerce.number().nonnegative({ message: 'Amount received must be non-negative' }),
  pendingBalance: z.coerce.number(),
  paymentDueDate: z.string().optional(),
  paymentFrequency: z.enum(['one-time', 'weekly', 'monthly', 'quarterly']).optional(),
});

const BuyerForm: React.FC<BuyerFormProps> = ({ 
  onSubmit, 
  onCancel, 
  onSuccess, 
  defaultValues 
}) => {
  const { toast } = useToast();
  const form = useForm<Buyer>({
    resolver: zodResolver(buyerSchema),
    defaultValues: defaultValues || {
      name: '',
      contact: '',
      quantitySold: 0,
      saleRate: 0,
      totalSaleAmount: 0,
      amountReceived: 0,
      pendingBalance: 0,
      paymentDueDate: '',
      paymentFrequency: 'one-time',
    },
  });

  const { watch, setValue } = form;
  const quantitySold = watch('quantitySold');
  const saleRate = watch('saleRate');
  const amountReceived = watch('amountReceived');

  // Calculate total sale amount and pending balance whenever quantity or sale rate changes
  React.useEffect(() => {
    const totalSaleAmount = quantitySold * saleRate;
    setValue('totalSaleAmount', totalSaleAmount);
    setValue('pendingBalance', totalSaleAmount - amountReceived);
  }, [quantitySold, saleRate, amountReceived, setValue]);

  const handleSubmit = (data: Buyer) => {
    if (onSubmit) {
      onSubmit(data);
    }
    
    toast({
      title: "Success",
      description: "Buyer has been added successfully",
    });
    
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buyer Name</FormLabel>
                <FormControl>
                  <Input placeholder="Buyer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Information</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number or email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantitySold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity Sold</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="saleRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Rate (per unit)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalSaleAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Sale Amount</FormLabel>
                <FormControl>
                  <Input type="number" disabled {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amountReceived"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount Received</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="pendingBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pending Balance</FormLabel>
              <FormControl>
                <Input type="number" disabled {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="paymentDueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Due Date (Optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Frequency (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="one-time">One Time</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Buyer</Button>
        </div>
      </form>
    </Form>
  );
};

export default BuyerForm;
