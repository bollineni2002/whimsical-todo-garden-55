
import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Supplier } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface SupplierFormProps {
  onSubmit?: (supplier: Supplier) => void;
  onCancel?: () => void;
  onSuccess?: () => void;
  defaultValues?: Partial<Supplier>;
}

const supplierSchema = z.object({
  name: z.string().min(1, { message: 'Supplier name is required' }),
  contact: z.string().min(1, { message: 'Contact information is required' }),
  goodsName: z.string().min(1, { message: 'Goods name is required' }),
  quantity: z.coerce.number().positive({ message: 'Quantity must be positive' }),
  purchaseRate: z.coerce.number().positive({ message: 'Purchase rate must be positive' }),
  totalCost: z.coerce.number().positive({ message: 'Total cost must be positive' }),
  amountPaid: z.coerce.number().nonnegative({ message: 'Amount paid must be non-negative' }),
  balance: z.coerce.number(),
  paymentDueDate: z.string().optional(),
  paymentFrequency: z.enum(['one-time', 'weekly', 'monthly', 'quarterly']).optional(),
});

const SupplierForm: React.FC<SupplierFormProps> = ({ 
  onSubmit, 
  onCancel, 
  onSuccess, 
  defaultValues 
}) => {
  const { toast } = useToast();
  const form = useForm<Supplier>({
    resolver: zodResolver(supplierSchema),
    defaultValues: defaultValues || {
      name: '',
      contact: '',
      goodsName: '',
      quantity: 0,
      purchaseRate: 0,
      totalCost: 0,
      amountPaid: 0,
      balance: 0,
      paymentDueDate: '',
      paymentFrequency: 'one-time',
    },
  });

  const { watch, setValue } = form;
  const quantity = watch('quantity');
  const purchaseRate = watch('purchaseRate');
  const amountPaid = watch('amountPaid');

  // Calculate total cost and balance whenever quantity or purchase rate changes
  React.useEffect(() => {
    const totalCost = quantity * purchaseRate;
    setValue('totalCost', totalCost);
    setValue('balance', totalCost - amountPaid);
  }, [quantity, purchaseRate, amountPaid, setValue]);

  const handleSubmit = (data: Supplier) => {
    if (onSubmit) {
      onSubmit(data);
    }
    
    toast({
      title: "Success",
      description: "Supplier has been added successfully",
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
                <FormLabel>Supplier Name</FormLabel>
                <FormControl>
                  <Input placeholder="Supplier name" {...field} />
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

        <FormField
          control={form.control}
          name="goodsName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goods Name</FormLabel>
              <FormControl>
                <Input placeholder="Name of goods" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Rate (per unit)</FormLabel>
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
            name="totalCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Cost</FormLabel>
                <FormControl>
                  <Input type="number" disabled {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amountPaid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount Paid</FormLabel>
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
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Balance Amount</FormLabel>
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
          <Button type="submit">Add Supplier</Button>
        </div>
      </form>
    </Form>
  );
};

export default SupplierForm;
