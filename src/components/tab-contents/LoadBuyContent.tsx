
import React, { useState } from 'react';
import { Transaction, LoadBuy } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Edit, Info, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { dbManager } from '@/lib/db';

interface LoadBuyContentProps {
  data: Transaction['loadBuy'];
  transaction: Transaction;
  refreshTransaction: () => Promise<void>;
}

const LoadBuyContent: React.FC<LoadBuyContentProps> = ({ data, transaction, refreshTransaction }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<LoadBuy>(data || {
    supplierName: '',
    supplierContact: '',
    goodsName: '',
    quantity: 0,
    purchaseRate: 0,
    totalCost: 0,
    amountPaid: 0,
    balance: 0
  });
  const { toast } = useToast();

  if (!data && !isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Load Purchase Details</h2>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Add Details
          </Button>
        </div>
        <div className="text-muted-foreground text-center py-8">No load purchase information available</div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue: string | number = value;
    
    // Convert numeric fields to numbers
    if (['quantity', 'purchaseRate', 'totalCost', 'amountPaid', 'balance'].includes(name)) {
      newValue = parseFloat(value) || 0;
      
      // Auto-calculate totalCost when quantity or purchaseRate changes
      if (name === 'quantity' || name === 'purchaseRate') {
        const quantity = name === 'quantity' ? parseFloat(value) || 0 : formData.quantity;
        const purchaseRate = name === 'purchaseRate' ? parseFloat(value) || 0 : formData.purchaseRate;
        const totalCost = quantity * purchaseRate;
        
        setFormData(prev => ({
          ...prev,
          [name]: newValue as number,
          totalCost,
          balance: totalCost - prev.amountPaid
        }));
        return;
      }
      
      // Auto-calculate balance when amountPaid changes
      if (name === 'amountPaid') {
        const amountPaidValue = parseFloat(value) || 0;
        const balance = formData.totalCost - amountPaidValue;
        setFormData(prev => ({
          ...prev,
          amountPaid: amountPaidValue,
          balance
        }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSave = async () => {
    try {
      // Create a new transaction object with updated loadBuy data
      const updatedTransaction = {
        ...transaction,
        loadBuy: formData,
        // Update totalAmount in the transaction to match the loadBuy totalCost
        totalAmount: formData.totalCost
      };
      
      // Check if we should update status to completed
      if (transaction.loadSold && formData.amountPaid >= formData.totalCost && 
          transaction.loadSold.amountReceived >= transaction.loadSold.totalSaleAmount) {
        updatedTransaction.status = 'completed';
      }
      
      await dbManager.updateTransaction(updatedTransaction);
      await refreshTransaction();
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Load purchase details updated successfully",
      });
    } catch (error) {
      console.error('Error updating load purchase details:', error);
      toast({
        title: "Error",
        description: "Failed to update load purchase details",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData(data || {
      supplierName: '',
      supplierContact: '',
      goodsName: '',
      quantity: 0,
      purchaseRate: 0,
      totalCost: 0,
      amountPaid: 0,
      balance: 0
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Load Purchase Details</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Supplier Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input 
                  id="supplierName" 
                  name="supplierName" 
                  value={formData.supplierName} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierContact">Contact Information</Label>
                <Input 
                  id="supplierContact" 
                  name="supplierContact" 
                  value={formData.supplierContact} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Goods Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="goodsName">Goods Name</Label>
                <Input 
                  id="goodsName" 
                  name="goodsName" 
                  value={formData.goodsName} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity" 
                  name="quantity" 
                  type="number" 
                  value={formData.quantity} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Financial Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseRate">Purchase Rate ($/unit)</Label>
              <Input 
                id="purchaseRate" 
                name="purchaseRate" 
                type="number" 
                value={formData.purchaseRate} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalCost">Total Cost ($)</Label>
              <Input 
                id="totalCost" 
                name="totalCost" 
                type="number" 
                value={formData.totalCost} 
                onChange={handleChange}
                readOnly 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountPaid">Amount Paid ($)</Label>
              <Input 
                id="amountPaid" 
                name="amountPaid" 
                type="number" 
                value={formData.amountPaid} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Balance ($)</Label>
              <Input 
                id="balance" 
                name="balance" 
                type="number" 
                value={formData.balance} 
                onChange={handleChange}
                readOnly 
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Load Purchase Details</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Info className="h-4 w-4 mr-1" />
            {showDetails ? "Hide Details" : "View Details"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit Details
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Supplier Information</h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Supplier Name</p>
              <p className="font-medium">{data.supplierName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Information</p>
              <p className="font-medium">{data.supplierContact || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Goods Information</h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Goods Name</p>
              <p className="font-medium">{data.goodsName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-medium">{data.quantity} units</p>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Financial Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Purchase Rate</p>
                <p className="text-lg font-semibold">${data.purchaseRate.toFixed(2)}/unit</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-lg font-semibold">${data.totalCost.toFixed(2)}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-lg font-semibold">${data.amountPaid.toFixed(2)}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-lg font-semibold">${data.balance.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {(data.paymentDueDate || data.paymentFrequency) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Payment Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.paymentDueDate && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Payment Due Date</p>
                    <p className="text-lg font-semibold">{new Date(data.paymentDueDate).toLocaleDateString()}</p>
                  </div>
                )}
                {data.paymentFrequency && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Payment Frequency</p>
                    <p className="text-lg font-semibold capitalize">{data.paymentFrequency}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LoadBuyContent;
