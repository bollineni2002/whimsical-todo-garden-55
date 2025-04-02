
import React, { useState } from 'react';
import { LoadBuy, Transaction, Supplier } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { dbManager } from '@/lib/db';
import { ArrowDownUp, Plus, Users, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SupplierForm from '../forms/SupplierForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface LoadBuyContentProps {
  data?: LoadBuy;
  transaction: Transaction;
  refreshTransaction: () => Promise<void>;
  suppliers?: Supplier[];
}

const LoadBuyContent: React.FC<LoadBuyContentProps> = ({ 
  data, 
  transaction, 
  refreshTransaction,
  suppliers = []
}) => {
  const { toast } = useToast();
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);

  // Renamed from handleAddSupplier
  const handleFormSubmit = async (formData: Supplier) => {
    try {
      let updatedTransaction: Transaction;
      let successMessage: string;

      if (!transaction.loadBuy) {
        // Create the primary LoadBuy object
        const newLoadBuy: LoadBuy = {
          supplierName: formData.name,
          supplierContact: formData.contact,
          goodsName: formData.goodsName,
          quantity: formData.quantity,
          purchaseRate: formData.purchaseRate,
          totalCost: formData.totalCost,
          amountPaid: formData.amountPaid,
          balance: formData.balance,
          paymentDueDate: formData.paymentDueDate,
          paymentFrequency: formData.paymentFrequency,
        };
        updatedTransaction = {
          ...transaction,
          loadBuy: newLoadBuy, // Set the primary loadBuy
          updatedAt: new Date().toISOString()
        };
        successMessage = "Purchase information added successfully";
      } else {
        // Add to the suppliers array (existing logic)
        const newSuppliers = [...(transaction.suppliers || []), formData];
        updatedTransaction = {
          ...transaction,
          suppliers: newSuppliers,
          updatedAt: new Date().toISOString()
        };
        successMessage = "Additional supplier added successfully";
      }

      await dbManager.updateTransaction(updatedTransaction);
      await refreshTransaction();
      
      toast({
        title: "Success",
        description: successMessage
      });

      setIsAddingSupplier(false); // Close dialog

    } catch (error) {
      console.error('Error processing supplier form:', error);
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive"
      });
    }
  };

  // Show single supplier information
  if (data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Purchase Information</h3>
          <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Another Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Supplier</DialogTitle>
              </DialogHeader>
              <SupplierForm onSubmit={handleFormSubmit} onCancel={() => setIsAddingSupplier(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border p-4 rounded-md">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Supplier Details</h4>
              <p className="font-medium">{data.supplierName}</p>
              <p className="text-sm text-muted-foreground">{data.supplierContact}</p>
            </div>
            
            <div className="border p-4 rounded-md">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Goods Information</h4>
              <p><span className="font-medium">Name:</span> {data.goodsName}</p>
              <p><span className="font-medium">Quantity:</span> {data.quantity}</p>
              <p><span className="font-medium">Purchase Rate:</span> ₹{data.purchaseRate}/unit</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="border p-4 rounded-md">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Payment Information</h4>
              <p><span className="font-medium">Total Cost:</span> ₹{data.totalCost}</p>
              <p><span className="font-medium">Amount Paid:</span> ₹{data.amountPaid}</p>
              <p className={`font-medium ${data.balance > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                Balance: ₹{data.balance}
              </p>
            </div>
            
            {data.paymentDueDate && (
              <div className="border p-4 rounded-md">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Payment Schedule</h4>
                <p><span className="font-medium">Due Date:</span> {data.paymentDueDate}</p>
                {data.paymentFrequency && (
                  <p><span className="font-medium">Frequency:</span> {data.paymentFrequency}</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Show additional suppliers if any */}
        {suppliers && suppliers.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Additional Suppliers</h3>
            <div className="grid grid-cols-1 gap-4">
              {suppliers.map((supplier, index) => (
                <Card key={index} className="border border-border">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">{supplier.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="py-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm"><span className="font-medium">Contact:</span> {supplier.contact}</p>
                        <p className="text-sm"><span className="font-medium">Goods:</span> {supplier.goodsName}</p>
                        <p className="text-sm"><span className="font-medium">Quantity:</span> {supplier.quantity}</p>
                        <p className="text-sm"><span className="font-medium">Rate:</span> ₹{supplier.purchaseRate}/unit</p>
                      </div>
                      <div>
                        <p className="text-sm"><span className="font-medium">Total Cost:</span> ₹{supplier.totalCost}</p>
                        <p className="text-sm"><span className="font-medium">Paid:</span> ₹{supplier.amountPaid}</p>
                        <p className={`text-sm font-medium ${supplier.balance > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                          Balance: ₹{supplier.balance}
                        </p>
                        {supplier.paymentDueDate && (
                          <p className="text-sm"><span className="font-medium">Due Date:</span> {supplier.paymentDueDate}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // No supplier data yet, show add supplier button
  return (
    <div className="text-center py-8">
      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No Purchase Information</h3>
      <p className="text-muted-foreground mb-6">
        Add purchase details to keep track of your goods and suppliers.
      </p>
      
      <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
          </DialogHeader>
          <SupplierForm onSubmit={handleFormSubmit} onCancel={() => setIsAddingSupplier(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoadBuyContent;
