
import React, { useState } from 'react';
import { Transaction, Payment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { dbManager } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/lib/utils';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface PaymentsContentProps {
  payments: Payment[];
  transaction: Transaction;
  refreshTransaction: () => Promise<void>;
}

const PaymentsContent: React.FC<PaymentsContentProps> = ({ payments, transaction, refreshTransaction }) => {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    amount: 0,
    mode: 'cash',
    counterparty: '',
    isIncoming: false,
    date: new Date().toISOString(),
    notes: '',
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNewPayment({
      ...newPayment,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleModeChange = (value: string) => {
    setNewPayment({
      ...newPayment,
      mode: value as 'cash' | 'cheque' | 'upi' | 'bank',
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewPayment({
      ...newPayment,
      isIncoming: checked,
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setNewPayment({
        ...newPayment,
        date: date.toISOString(),
      });
    }
  };

  const addPayment = async () => {
    try {
      if (!newPayment.amount || !newPayment.counterparty) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const payment: Payment = {
        id: generateId('pay'),
        date: newPayment.date || new Date().toISOString(),
        amount: newPayment.amount as number,
        mode: newPayment.mode as 'cash' | 'cheque' | 'upi' | 'bank',
        counterparty: newPayment.counterparty as string,
        isIncoming: newPayment.isIncoming as boolean,
        notes: newPayment.notes,
        paymentTime: new Date().toTimeString().split(' ')[0],
      };

      // Update transaction with new payment
      const updatedTransaction = {
        ...transaction,
        payments: [...transaction.payments, payment],
      };

      // If loadBuy exists and this is an outgoing payment (payment to supplier)
      if (transaction.loadBuy && !payment.isIncoming) {
        updatedTransaction.loadBuy = {
          ...transaction.loadBuy,
          amountPaid: transaction.loadBuy.amountPaid + payment.amount,
          balance: transaction.loadBuy.balance - payment.amount,
        };
      }

      // If loadSold exists and this is an incoming payment (payment from buyer)
      if (transaction.loadSold && payment.isIncoming) {
        updatedTransaction.loadSold = {
          ...transaction.loadSold,
          amountReceived: transaction.loadSold.amountReceived + payment.amount,
          pendingBalance: transaction.loadSold.pendingBalance - payment.amount,
        };
      }

      await dbManager.updateTransaction(updatedTransaction);
      
      toast({
        title: "Success",
        description: "Payment added successfully",
      });
      
      setIsAddingPayment(false);
      setNewPayment({
        amount: 0,
        mode: 'cash',
        counterparty: '',
        isIncoming: false,
        date: new Date().toISOString(),
        notes: '',
      });
      
      await refreshTransaction();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to add payment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Payments</h2>
        <Button 
          onClick={() => setIsAddingPayment(true)}
          variant="default"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Payment
        </Button>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No payments recorded yet. Add your first payment.
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="border rounded-lg p-4 hover:bg-accent/5 transition-colors">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-2 md:mb-0">
                  <div className="flex items-center">
                    <span className={`mr-2 font-medium ${payment.isIncoming ? 'text-success' : 'text-destructive'}`}>
                      {payment.isIncoming ? '+' : '-'} ${payment.amount.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground text-sm">({payment.mode})</span>
                  </div>
                  <p className="text-sm text-muted-foreground">To/From: {payment.counterparty}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm">{new Date(payment.date).toLocaleDateString()}</div>
                  {payment.paymentTime && (
                    <div className="text-xs text-muted-foreground">{payment.paymentTime}</div>
                  )}
                </div>
              </div>
              {payment.notes && (
                <div className="mt-2 text-sm border-t pt-2">
                  <p className="text-muted-foreground">{payment.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Payment Dialog */}
      <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Payment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="Enter amount"
                value={newPayment.amount || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select onValueChange={handleModeChange} defaultValue={newPayment.mode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="counterparty">Counterparty</Label>
              <Input
                id="counterparty"
                name="counterparty"
                placeholder="Enter counterparty name"
                value={newPayment.counterparty || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label>Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !newPayment.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newPayment.date ? format(new Date(newPayment.date), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newPayment.date ? new Date(newPayment.date) : undefined}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="isIncoming" 
                checked={newPayment.isIncoming}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isIncoming">
                {newPayment.isIncoming ? "Incoming Payment (Received)" : "Outgoing Payment (Paid)"}
              </Label>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Add payment notes"
                value={newPayment.notes || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingPayment(false)}>Cancel</Button>
            <Button onClick={addPayment}>Add Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsContent;
