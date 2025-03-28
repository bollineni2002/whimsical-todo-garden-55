import React, { useState, useEffect } from 'react';
import { Transaction, LoadSold } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Edit, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { dbManager } from '@/lib/db';
import { useCurrency } from '@/context/CurrencyContext'; // Import useCurrency hook

interface LoadSoldContentProps {
  data: Transaction['loadSold'];
  transaction: Transaction;
  refreshTransaction: () => Promise<void>;
}

const LoadSoldContent: React.FC<LoadSoldContentProps> = ({ data, transaction, refreshTransaction }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<LoadSold>(data || {
    buyerName: '',
    buyerContact: '',
    quantitySold: 0,
    saleRate: 0,
    totalSaleAmount: 0,
    amountReceived: 0,
    pendingBalance: 0
  });
  const { toast } = useToast();
  const { formatCurrency } = useCurrency(); // Get formatCurrency from context

  useEffect(() => {
    if (!data) {
      setIsEditing(true);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue: string | number = value;
    
    if (['quantitySold', 'saleRate', 'totalSaleAmount', 'amountReceived', 'pendingBalance'].includes(name)) {
      newValue = parseFloat(value) || 0;
      
      if (name === 'quantitySold' || name === 'saleRate') {
        const quantitySold = name === 'quantitySold' ? parseFloat(value) || 0 : formData.quantitySold;
        const saleRate = name === 'saleRate' ? parseFloat(value) || 0 : formData.saleRate;
        const totalSaleAmount = quantitySold * saleRate;
        
        setFormData(prev => ({
          ...prev,
          [name]: newValue as number,
          totalSaleAmount,
          pendingBalance: totalSaleAmount - prev.amountReceived
        }));
        return;
      }
      
      if (name === 'amountReceived') {
        const amountReceivedValue = parseFloat(value) || 0;
        const pendingBalance = formData.totalSaleAmount - amountReceivedValue;
        setFormData(prev => ({
          ...prev,
          amountReceived: amountReceivedValue,
          pendingBalance
        }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSave = async () => {
    try {
      const updatedTransaction = {
        ...transaction,
        loadSold: formData,
      };
      
      if (transaction.loadBuy && formData.amountReceived >= formData.totalSaleAmount && 
          transaction.loadBuy.amountPaid >= transaction.loadBuy.totalCost) {
        updatedTransaction.status = 'completed';
      }
      
      await dbManager.updateTransaction(updatedTransaction);
      await refreshTransaction();
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Load sale details updated successfully",
      });
    } catch (error) {
      console.error('Error updating load sale details:', error);
      toast({
        title: "Error",
        description: "Failed to update load sale details",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData(data || {
      buyerName: '',
      buyerContact: '',
      quantitySold: 0,
      saleRate: 0,
      totalSaleAmount: 0,
      amountReceived: 0,
      pendingBalance: 0
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{data ? "Edit Load Sale Details" : "Add Load Sale Details"}</h2>
          <div className="flex space-x-2">
            {data && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
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
            <h3 className="text-lg font-medium">Buyer Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="buyerName">Buyer Name</Label>
                <Input 
                  id="buyerName" 
                  name="buyerName" 
                  value={formData.buyerName} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerContact">Contact Information</Label>
                <Input 
                  id="buyerContact" 
                  name="buyerContact" 
                  value={formData.buyerContact} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sale Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="quantitySold">Quantity Sold</Label>
                <Input 
                  id="quantitySold" 
                  name="quantitySold" 
                  type="number" 
                  value={formData.quantitySold} 
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
              <Label htmlFor="saleRate">Sale Rate (/unit)</Label>
              <Input 
                id="saleRate" 
                name="saleRate" 
                type="number" 
                value={formData.saleRate} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalSaleAmount">Total Sale Amount</Label>
              <Input 
                id="totalSaleAmount" 
                name="totalSaleAmount" 
                type="number" 
                value={formData.totalSaleAmount} 
                onChange={handleChange}
                readOnly 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountReceived">Amount Received</Label>
              <Input 
                id="amountReceived" 
                name="amountReceived" 
                type="number" 
                value={formData.amountReceived} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pendingBalance">Pending Balance</Label>
              <Input 
                id="pendingBalance" 
                name="pendingBalance" 
                type="number" 
                value={formData.pendingBalance} 
                onChange={handleChange}
                readOnly 
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Payment Schedule (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentDueDate">Payment Due Date</Label>
              <Input 
                id="paymentDueDate" 
                name="paymentDueDate" 
                type="date" 
                value={formData.paymentDueDate || ''} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentFrequency">Payment Frequency</Label>
              <select
                id="paymentFrequency"
                name="paymentFrequency"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.paymentFrequency || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentFrequency: e.target.value as any }))}
              >
                <option value="">Select frequency</option>
                <option value="one-time">One-time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Load Sale Details</h2>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Add Details
          </Button>
        </div>
        <div className="text-muted-foreground text-center py-8">No load sale information available. Click 'Add Details' to add information.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Load Sale Details</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsEditing(true)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit Details
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Buyer Information</h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Buyer Name</p>
              <p className="font-medium">{data.buyerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Information</p>
              <p className="font-medium">{data.buyerContact || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Sale Information</h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Quantity Sold</p>
              <p className="font-medium">{data.quantitySold} units</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Financial Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Sale Rate</p>
            {/* Apply formatting */}
            <p className="text-lg font-semibold">{formatCurrency(data.saleRate)}/unit</p> 
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Sale Amount</p>
            {/* Apply formatting */}
            <p className="text-lg font-semibold">{formatCurrency(data.totalSaleAmount)}</p> 
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Amount Received</p>
            {/* Apply formatting */}
            <p className="text-lg font-semibold">{formatCurrency(data.amountReceived)}</p> 
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Pending Balance</p>
            {/* Apply formatting */}
            <p className="text-lg font-semibold">{formatCurrency(data.pendingBalance)}</p> 
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
    </div>
  );
};

export default LoadSoldContent;
