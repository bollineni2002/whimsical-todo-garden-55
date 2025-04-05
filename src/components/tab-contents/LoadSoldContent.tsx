
import React, { useState } from 'react';
import { LoadSold, Transaction, Buyer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { dbManager } from '@/lib/db';
import { ShoppingCart, Plus, Users, UserPlus, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import BuyerForm from '../forms/BuyerForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface LoadSoldContentProps {
  data?: LoadSold;
  transaction: Transaction;
  refreshTransaction: () => Promise<void>;
  buyers?: Buyer[];
}

const LoadSoldContent: React.FC<LoadSoldContentProps> = ({ 
  data, 
  transaction, 
  refreshTransaction,
  buyers = []
}) => {
  const { toast } = useToast();
  const [isAddingBuyer, setIsAddingBuyer] = useState(false);
  const [isEditingPrimary, setIsEditingPrimary] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Renamed from handleAddBuyer
  const handleFormSubmit = async (formData: Buyer) => {
    try {
      let updatedTransaction: Transaction;
      let successMessage: string;

      if (!transaction.loadSold) {
        // Create the primary LoadSold object
        const newLoadSold: LoadSold = {
          buyerName: formData.name,
          buyerContact: formData.contact,
          quantitySold: formData.quantitySold,
          saleRate: formData.saleRate,
          totalSaleAmount: formData.totalSaleAmount,
          amountReceived: formData.amountReceived,
          pendingBalance: formData.pendingBalance,
          paymentDueDate: formData.paymentDueDate,
          paymentFrequency: formData.paymentFrequency,
        };
        updatedTransaction = {
          ...transaction,
          loadSold: newLoadSold, // Set the primary loadSold
          updatedAt: new Date().toISOString()
        };
        successMessage = "Sale information added successfully";
      } else {
        // Add to the buyers array (existing logic)
        const newBuyers = [...(transaction.buyers || []), formData];
        updatedTransaction = {
          ...transaction,
          buyers: newBuyers,
          updatedAt: new Date().toISOString()
        };
        successMessage = "Additional buyer added successfully";
      }

      await dbManager.updateTransaction(updatedTransaction);
      await refreshTransaction();

      toast({
        title: "Success",
        description: successMessage
      });

      setIsAddingBuyer(false); // Close dialog

    } catch (error) {
      console.error('Error processing buyer form:', error);
      toast({
        title: "Error",
        description: "Failed to add buyer",
        variant: "destructive"
      });
    }
  };

  // New handler for updating the primary buyer info
  const handleUpdatePrimary = async (formData: Buyer) => {
    try {
      if (!transaction.loadSold) {
        toast({
          title: "Error",
          description: "No buyer information found to update",
          variant: "destructive"
        });
        return;
      }

      // Create updated LoadSold object
      const updatedLoadSold: LoadSold = {
        buyerName: formData.name,
        buyerContact: formData.contact,
        quantitySold: formData.quantitySold,
        saleRate: formData.saleRate,
        totalSaleAmount: formData.totalSaleAmount,
        amountReceived: formData.amountReceived,
        pendingBalance: formData.pendingBalance,
        paymentDueDate: formData.paymentDueDate,
        paymentFrequency: formData.paymentFrequency,
      };

      const updatedTransaction = {
        ...transaction,
        loadSold: updatedLoadSold,
        updatedAt: new Date().toISOString()
      };

      await dbManager.updateTransaction(updatedTransaction);
      await refreshTransaction();
      
      toast({
        title: "Success",
        description: "Buyer information updated successfully"
      });

      setEditDialogOpen(false);
      setIsEditingPrimary(false);
    } catch (error) {
      console.error('Error updating buyer information:', error);
      toast({
        title: "Error",
        description: "Failed to update buyer information",
        variant: "destructive"
      });
    }
  };
  
  // Function to convert LoadSold to Buyer format for editing
  const convertLoadSoldToBuyer = (loadSold: LoadSold): Buyer => {
    return {
      name: loadSold.buyerName,
      contact: loadSold.buyerContact,
      quantitySold: loadSold.quantitySold,
      saleRate: loadSold.saleRate,
      totalSaleAmount: loadSold.totalSaleAmount,
      amountReceived: loadSold.amountReceived,
      pendingBalance: loadSold.pendingBalance,
      paymentDueDate: loadSold.paymentDueDate,
      paymentFrequency: loadSold.paymentFrequency,
    };
  };

  // Show main buyer information
  if (data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Sale Information</h3>
          <div className="space-x-2">
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Buyer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Buyer</DialogTitle>
                </DialogHeader>
                {data && (
                  <BuyerForm 
                    onSubmit={handleUpdatePrimary} 
                    onCancel={() => setEditDialogOpen(false)}
                    initialData={convertLoadSoldToBuyer(data)}
                    isEditing={true}
                  />
                )}
              </DialogContent>
            </Dialog>
            
            <Dialog open={isAddingBuyer} onOpenChange={setIsAddingBuyer}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Another Buyer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Buyer</DialogTitle>
                </DialogHeader>
                <BuyerForm onSubmit={handleFormSubmit} onCancel={() => setIsAddingBuyer(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border p-4 rounded-md">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Buyer Details</h4>
              <p className="font-medium">{data.buyerName}</p>
              <p className="text-sm text-muted-foreground">{data.buyerContact}</p>
            </div>
            
            <div className="border p-4 rounded-md">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Sale Information</h4>
              <p><span className="font-medium">Quantity Sold:</span> {data.quantitySold}</p>
              <p><span className="font-medium">Sale Rate:</span> ₹{data.saleRate}/unit</p>
              <p><span className="font-medium">Total Sale Amount:</span> ₹{data.totalSaleAmount}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="border p-4 rounded-md">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Payment Information</h4>
              <p><span className="font-medium">Amount Received:</span> ₹{data.amountReceived}</p>
              <p className={`font-medium ${data.pendingBalance > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                Pending Balance: ₹{data.pendingBalance}
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

        {/* Show additional buyers if any */}
        {buyers && buyers.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Additional Buyers</h3>
            <div className="grid grid-cols-1 gap-4">
              {buyers.map((buyer, index) => (
                <Card key={index} className="border border-border">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">{buyer.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="py-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm"><span className="font-medium">Contact:</span> {buyer.contact}</p>
                        <p className="text-sm"><span className="font-medium">Quantity:</span> {buyer.quantitySold}</p>
                        <p className="text-sm"><span className="font-medium">Rate:</span> ₹{buyer.saleRate}/unit</p>
                      </div>
                      <div>
                        <p className="text-sm"><span className="font-medium">Total Amount:</span> ₹{buyer.totalSaleAmount}</p>
                        <p className="text-sm"><span className="font-medium">Received:</span> ₹{buyer.amountReceived}</p>
                        <p className={`text-sm font-medium ${buyer.pendingBalance > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                          Pending: ₹{buyer.pendingBalance}
                        </p>
                        {buyer.paymentDueDate && (
                          <p className="text-sm"><span className="font-medium">Due Date:</span> {buyer.paymentDueDate}</p>
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

  // No buyer data yet, show add buyer button
  return (
    <div className="text-center py-8">
      <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No Sale Information</h3>
      <p className="text-muted-foreground mb-6">
        Add sale details to keep track of your buyers and revenue.
      </p>
      
      <Dialog open={isAddingBuyer} onOpenChange={setIsAddingBuyer}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Buyer
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Buyer</DialogTitle>
          </DialogHeader>
          <BuyerForm onSubmit={handleFormSubmit} onCancel={() => setIsAddingBuyer(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoadSoldContent;
