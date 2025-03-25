
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const TransactionForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // States for optional sections
  const [includeBuy, setIncludeBuy] = useState(true);
  const [includeTransportation, setIncludeTransportation] = useState(true);
  const [includeSold, setIncludeSold] = useState(true);
  
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
      const currentDate = new Date().toISOString();
      let totalCost = 0;
      let totalSaleAmount = 0;
      
      // Create a partially initialized transaction object
      const newTransaction: Partial<Transaction> = {
        id: generateId('txn'),
        name: data.name || `Transaction ${generateId('').slice(0, 5)}`,
        date: currentDate,
        status: data.status as 'completed' | 'pending' | 'cancelled',
        payments: [],
        notes: [],
        attachments: [],
        updatedAt: currentDate,
        user_id: user?.id,
      };
      
      // Add loadBuy section if included
      if (includeBuy) {
        const purchaseRate = parseFloat(data.purchaseRate) || 0;
        const quantity = parseFloat(data.quantity) || 0;
        totalCost = purchaseRate * quantity;
        
        newTransaction.loadBuy = {
          supplierName: data.supplierName,
          supplierContact: data.supplierContact,
          goodsName: data.goodsName,
          quantity: quantity,
          purchaseRate: purchaseRate,
          totalCost: totalCost,
          amountPaid: 0,
          balance: totalCost,
        };
      }
      
      // Add loadSold section if included (empty placeholder for now)
      if (includeSold) {
        newTransaction.loadSold = {
          buyerName: '',
          buyerContact: '',
          quantitySold: 0,
          saleRate: 0,
          totalSaleAmount: 0,
          amountReceived: 0,
          pendingBalance: 0,
        };
        totalSaleAmount = 0;
      }
      
      // Add transportation section if included
      if (includeTransportation) {
        newTransaction.transportation = {
          vehicleType: '',
          vehicleNumber: '',
          emptyWeight: 0,
          loadedWeight: 0,
          origin: '',
          destination: '',
          charges: 0,
        };
      }
      
      // Calculate total amount based on included sections
      newTransaction.totalAmount = totalSaleAmount > 0 ? totalSaleAmount : totalCost;

      await dbManager.addTransaction(newTransaction as Transaction);
      
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
          
          <div className="space-y-4 bg-muted/20 p-4 rounded-md">
            <h3 className="text-lg font-medium">Transaction Sections</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select the sections relevant to this transaction. You can add more details later.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeBuy" 
                  checked={includeBuy} 
                  onCheckedChange={(checked) => setIncludeBuy(!!checked)} 
                />
                <Label htmlFor="includeBuy">Include Purchase</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeTransportation" 
                  checked={includeTransportation} 
                  onCheckedChange={(checked) => setIncludeTransportation(!!checked)} 
                />
                <Label htmlFor="includeTransportation">Include Transportation</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeSold" 
                  checked={includeSold} 
                  onCheckedChange={(checked) => setIncludeSold(!!checked)} 
                />
                <Label htmlFor="includeSold">Include Sale</Label>
              </div>
            </div>
          </div>
          
          {includeBuy && (
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-4">Purchase Details</h3>
              <TransactionSupplierFields control={form.control} />
              <TransactionGoodsFields control={form.control} />
            </div>
          )}
          
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
