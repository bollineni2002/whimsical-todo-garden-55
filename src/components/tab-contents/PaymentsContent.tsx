import React, { useState } from 'react';
import { CompleteTransaction, Payment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { transactionService } from '@/lib/transaction-service';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { CalendarIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface PaymentsContentProps {
  transaction: CompleteTransaction;
  refreshTransaction: () => Promise<void>;
}

const PaymentsContent: React.FC<PaymentsContentProps> = ({ transaction, refreshTransaction }) => {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [newPayment, setNewPayment] = useState<Omit<Payment, 'id'>>({
    transaction_id: transaction.transaction.id,
    amount: 0,
    payment_mode: 'cash',
    counterparty: '',
    direction: 'outgoing',
    payment_date: new Date().toISOString(),
    notes: '',
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (isEditingPayment && selectedPayment) {
      // Handle editing existing payment
      setSelectedPayment({
        ...selectedPayment,
        [name]: type === 'number' ? parseFloat(value) : value,
      });
    } else {
      // Handle adding new payment
      setNewPayment({
        ...newPayment,
        [name]: type === 'number' ? parseFloat(value) : value,
      });
    }
  };

  const handleModeChange = (value: string) => {
    if (isEditingPayment && selectedPayment) {
      setSelectedPayment({
        ...selectedPayment,
        payment_mode: value as 'cash' | 'cheque' | 'upi' | 'bank',
      });
    } else {
      setNewPayment({
        ...newPayment,
        payment_mode: value as 'cash' | 'cheque' | 'upi' | 'bank',
      });
    }
  };

  const handleDirectionChange = (checked: boolean) => {
    if (isEditingPayment && selectedPayment) {
      setSelectedPayment({
        ...selectedPayment,
        direction: checked ? 'incoming' : 'outgoing',
      });
    } else {
      setNewPayment({
        ...newPayment,
        direction: checked ? 'incoming' : 'outgoing',
      });
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      if (isEditingPayment && selectedPayment) {
        setSelectedPayment({
          ...selectedPayment,
          payment_date: date.toISOString(),
        });
      } else {
        setNewPayment({
          ...newPayment,
          payment_date: date.toISOString(),
        });
      }
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

      await transactionService.addPayment(newPayment);

      toast({
        title: "Success",
        description: "Payment added successfully",
      });

      setIsAddingPayment(false);
      setNewPayment({
        transaction_id: transaction.transaction.id,
        amount: 0,
        payment_mode: 'cash',
        counterparty: '',
        direction: 'outgoing',
        payment_date: new Date().toISOString(),
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

  const updatePayment = async () => {
    try {
      if (!selectedPayment) return;

      if (!selectedPayment.amount || !selectedPayment.counterparty) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      await transactionService.updatePayment(selectedPayment);

      toast({
        title: "Success",
        description: "Payment updated successfully",
      });

      setIsEditingPayment(false);
      setSelectedPayment(null);

      await refreshTransaction();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Error",
        description: "Failed to update payment",
        variant: "destructive",
      });
    }
  };

  const deletePayment = async () => {
    try {
      if (!selectedPayment) return;

      await transactionService.deletePayment(selectedPayment.id);

      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });

      setIsDeletingPayment(false);
      setSelectedPayment(null);

      await refreshTransaction();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsEditingPayment(true);
  };

  const openDeleteDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDeletingPayment(true);
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

      {transaction.payments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No payments recorded yet. Add your first payment.
        </div>
      ) : (
        <div className="space-y-4">
          {transaction.payments.map((payment) => (
            <div key={payment.id} className="border rounded-lg p-4 hover:bg-accent/5 transition-colors">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-2 md:mb-0">
                  <div className="flex items-center">
                    <span className={`mr-2 font-medium ${payment.direction === 'incoming' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {payment.direction === 'incoming' ? '+' : '-'} {formatCurrency(payment.amount)}
                    </span>
                    <span className="text-muted-foreground text-sm">({payment.payment_mode})</span>
                  </div>
                  <p className="text-sm text-muted-foreground">To/From: {payment.counterparty}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <div className="text-sm">{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'No date'}</div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(payment)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(payment)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
              <Select onValueChange={handleModeChange} defaultValue={newPayment.payment_mode}>
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
                id="direction"
                checked={newPayment.direction === 'incoming'}
                onCheckedChange={handleDirectionChange}
              />
              <Label htmlFor="direction">
                {newPayment.direction === 'incoming' ? "Incoming Payment (Received)" : "Outgoing Payment (Paid)"}
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

      {/* Edit Payment Dialog */}
      <Dialog open={isEditingPayment} onOpenChange={setIsEditingPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="edit_amount">Amount</Label>
                <Input
                  id="edit_amount"
                  name="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={selectedPayment.amount || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="edit_payment_mode">Payment Mode</Label>
                <Select onValueChange={handleModeChange} value={selectedPayment.payment_mode}>
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
                <Label htmlFor="edit_counterparty">Counterparty</Label>
                <Input
                  id="edit_counterparty"
                  name="counterparty"
                  placeholder="Enter counterparty name"
                  value={selectedPayment.counterparty || ''}
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
                        !selectedPayment.payment_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedPayment.payment_date ? format(new Date(selectedPayment.payment_date), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedPayment.payment_date ? new Date(selectedPayment.payment_date) : undefined}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_direction"
                  checked={selectedPayment.direction === 'incoming'}
                  onCheckedChange={handleDirectionChange}
                />
                <Label htmlFor="edit_direction">
                  {selectedPayment.direction === 'incoming' ? "Incoming Payment (Received)" : "Outgoing Payment (Paid)"}
                </Label>
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="edit_notes">Notes (Optional)</Label>
                <Input
                  id="edit_notes"
                  name="notes"
                  placeholder="Add payment notes"
                  value={selectedPayment.notes || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingPayment(false)}>Cancel</Button>
            <Button onClick={updatePayment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Dialog */}
      <Dialog open={isDeletingPayment} onOpenChange={setIsDeletingPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this payment? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletingPayment(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deletePayment}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsContent;
