
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Buyer } from '@/lib/types';

interface BuyerFormProps {
  onSubmit: (data: Buyer) => void;
  onCancel: () => void;
  initialData?: Buyer;
  isEditing?: boolean;
}

const BuyerForm: React.FC<BuyerFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<Buyer>({
    name: '',
    contact: '',
    quantitySold: 0,
    saleRate: 0,
    totalSaleAmount: 0,
    amountReceived: 0,
    pendingBalance: 0,
    paymentDueDate: '',
    paymentFrequency: undefined
  });

  // Load initial data if provided (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let numValue: number | string = value;
    
    // Convert numeric fields
    if (['quantitySold', 'saleRate', 'amountReceived'].includes(name)) {
      numValue = parseFloat(value) || 0;
      
      if (name === 'quantitySold' || name === 'saleRate') {
        const quantity = name === 'quantitySold' ? numValue as number : formData.quantitySold;
        const rate = name === 'saleRate' ? numValue as number : formData.saleRate;
        const totalSaleAmount = quantity * rate;
        const pendingBalance = totalSaleAmount - formData.amountReceived;
        
        setFormData(prev => ({
          ...prev,
          [name]: numValue as number,
          totalSaleAmount,
          pendingBalance
        }));
        return;
      }
      
      if (name === 'amountReceived') {
        const received = numValue as number;
        const pendingBalance = formData.totalSaleAmount - received;
        
        setFormData(prev => ({
          ...prev,
          amountReceived: received,
          pendingBalance
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleFrequencyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      paymentFrequency: value as 'one-time' | 'weekly' | 'monthly' | 'quarterly' | undefined
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Buyer Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter buyer name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact">Contact Number</Label>
          <Input
            id="contact"
            name="contact"
            placeholder="Enter contact number"
            value={formData.contact}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantitySold">Quantity Sold</Label>
          <Input
            id="quantitySold"
            name="quantitySold"
            type="number"
            placeholder="Enter quantity"
            value={formData.quantitySold}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="saleRate">Sale Rate (per unit)</Label>
          <Input
            id="saleRate"
            name="saleRate"
            type="number"
            placeholder="Enter rate per unit"
            value={formData.saleRate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="totalSaleAmount">Total Sale Amount</Label>
          <Input
            id="totalSaleAmount"
            name="totalSaleAmount"
            type="number"
            value={formData.totalSaleAmount}
            readOnly
            className="bg-muted"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amountReceived">Amount Received</Label>
          <Input
            id="amountReceived"
            name="amountReceived"
            type="number"
            placeholder="Enter amount received"
            value={formData.amountReceived}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pendingBalance">Pending Balance</Label>
          <Input
            id="pendingBalance"
            name="pendingBalance"
            type="number"
            value={formData.pendingBalance}
            readOnly
            className="bg-muted"
          />
        </div>
        
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
          <Select 
            onValueChange={handleFrequencyChange}
            value={formData.paymentFrequency}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one-time">One-time</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update Buyer' : 'Add Buyer'}
        </Button>
      </div>
    </form>
  );
};

export default BuyerForm;
