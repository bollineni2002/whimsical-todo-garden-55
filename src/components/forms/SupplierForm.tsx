
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Supplier } from '@/lib/types';

interface SupplierFormProps {
  onSubmit: (data: Supplier) => void;
  onCancel: () => void;
  initialData?: Supplier;
  isEditing?: boolean;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<Supplier>({
    name: '',
    contact: '',
    goodsName: '',
    quantity: 0,
    purchaseRate: 0,
    totalCost: 0,
    amountPaid: 0,
    balance: 0,
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
    if (['quantity', 'purchaseRate', 'amountPaid'].includes(name)) {
      numValue = parseFloat(value) || 0;
      
      if (name === 'quantity' || name === 'purchaseRate') {
        const quantity = name === 'quantity' ? numValue as number : formData.quantity;
        const rate = name === 'purchaseRate' ? numValue as number : formData.purchaseRate;
        const totalCost = quantity * rate;
        const balance = totalCost - formData.amountPaid;
        
        setFormData(prev => ({
          ...prev,
          [name]: numValue as number,
          totalCost,
          balance
        }));
        return;
      }
      
      if (name === 'amountPaid') {
        const paid = numValue as number;
        const balance = formData.totalCost - paid;
        
        setFormData(prev => ({
          ...prev,
          amountPaid: paid,
          balance
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
          <Label htmlFor="name">Supplier Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter supplier name"
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
          <Label htmlFor="goodsName">Goods Name</Label>
          <Input
            id="goodsName"
            name="goodsName"
            placeholder="Enter goods name"
            value={formData.goodsName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            placeholder="Enter quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="purchaseRate">Purchase Rate (per unit)</Label>
          <Input
            id="purchaseRate"
            name="purchaseRate"
            type="number"
            placeholder="Enter rate per unit"
            value={formData.purchaseRate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="totalCost">Total Cost</Label>
          <Input
            id="totalCost"
            name="totalCost"
            type="number"
            value={formData.totalCost}
            readOnly
            className="bg-muted"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amountPaid">Amount Paid</Label>
          <Input
            id="amountPaid"
            name="amountPaid"
            type="number"
            placeholder="Enter amount paid"
            value={formData.amountPaid}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="balance">Balance Due</Label>
          <Input
            id="balance"
            name="balance"
            type="number"
            value={formData.balance}
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
          {isEditing ? 'Update Supplier' : 'Add Supplier'}
        </Button>
      </div>
    </form>
  );
};

export default SupplierForm;
