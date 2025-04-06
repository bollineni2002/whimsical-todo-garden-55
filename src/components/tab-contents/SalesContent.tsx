import { useState } from 'react';
import { Sale, CompleteTransaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { transactionService } from '@/lib/transaction-service';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SalesContentProps {
  transaction: CompleteTransaction;
  refreshTransaction: () => Promise<void>;
}

const SalesContent: React.FC<SalesContentProps> = ({ transaction, refreshTransaction }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [newSale, setNewSale] = useState<Omit<Sale, 'id'>>({
    transaction_id: transaction.transaction.id,
    buyer_name: '',
    contact_number: '',
    quantity: 0,
    rate: 0,
    total_amount: 0,
    amount_received: 0,
    balance_due: 0,
    payment_frequency: 'one-time'
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (isEditDialogOpen && selectedSale) {
      // Handle editing existing sale
      const updatedSale = { ...selectedSale };
      
      if (name === 'quantity' || name === 'rate') {
        const quantity = name === 'quantity' ? parseFloat(value) || 0 : selectedSale.quantity;
        const rate = name === 'rate' ? parseFloat(value) || 0 : selectedSale.rate;
        const totalAmount = quantity * rate;
        
        updatedSale[name] = parseFloat(value) || 0;
        updatedSale.total_amount = totalAmount;
        updatedSale.balance_due = totalAmount - updatedSale.amount_received;
      } else if (name === 'amount_received') {
        const amountReceived = parseFloat(value) || 0;
        updatedSale.amount_received = amountReceived;
        updatedSale.balance_due = updatedSale.total_amount - amountReceived;
      } else {
        (updatedSale as any)[name] = value;
      }
      
      setSelectedSale(updatedSale);
    } else {
      // Handle adding new sale
      if (name === 'quantity' || name === 'rate') {
        const quantity = name === 'quantity' ? parseFloat(value) || 0 : newSale.quantity;
        const rate = name === 'rate' ? parseFloat(value) || 0 : newSale.rate;
        const totalAmount = quantity * rate;
        
        setNewSale(prev => ({
          ...prev,
          [name]: parseFloat(value) || 0,
          total_amount: totalAmount,
          balance_due: totalAmount - prev.amount_received
        }));
      } else if (name === 'amount_received') {
        const amountReceived = parseFloat(value) || 0;
        setNewSale(prev => ({
          ...prev,
          amount_received: amountReceived,
          balance_due: prev.total_amount - amountReceived
        }));
      } else {
        setNewSale(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSelectChange = (value: string) => {
    if (isEditDialogOpen && selectedSale) {
      setSelectedSale(prev => ({
        ...prev,
        payment_frequency: value as 'one-time' | 'weekly' | 'monthly' | 'quarterly'
      }));
    } else {
      setNewSale(prev => ({
        ...prev,
        payment_frequency: value as 'one-time' | 'weekly' | 'monthly' | 'quarterly'
      }));
    }
  };

  const handleAddSale = async () => {
    try {
      if (!newSale.buyer_name) {
        toast({
          title: 'Validation Error',
          description: 'Buyer name is required',
          variant: 'destructive'
        });
        return;
      }

      await transactionService.addSale(newSale);
      await refreshTransaction();
      
      setNewSale({
        transaction_id: transaction.transaction.id,
        buyer_name: '',
        contact_number: '',
        quantity: 0,
        rate: 0,
        total_amount: 0,
        amount_received: 0,
        balance_due: 0,
        payment_frequency: 'one-time'
      });
      
      setIsAddDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Sale added successfully'
      });
    } catch (error) {
      console.error('Error adding sale:', error);
      toast({
        title: 'Error',
        description: 'Failed to add sale',
        variant: 'destructive'
      });
    }
  };

  const handleEditSale = async () => {
    try {
      if (!selectedSale) return;
      
      if (!selectedSale.buyer_name) {
        toast({
          title: 'Validation Error',
          description: 'Buyer name is required',
          variant: 'destructive'
        });
        return;
      }

      await transactionService.updateSale(selectedSale);
      await refreshTransaction();
      
      setSelectedSale(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Sale updated successfully'
      });
    } catch (error) {
      console.error('Error updating sale:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sale',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSale = async () => {
    try {
      if (!selectedSale) return;

      await transactionService.deleteSale(selectedSale.id);
      await refreshTransaction();
      
      setSelectedSale(null);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Sale deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete sale',
        variant: 'destructive'
      });
    }
  };

  const openEditDialog = (sale: Sale) => {
    setSelectedSale(sale);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Sales</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Sale</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="buyer_name" className="text-right">Buyer Name</Label>
                <Input
                  id="buyer_name"
                  name="buyer_name"
                  value={newSale.buyer_name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact_number" className="text-right">Contact Number</Label>
                <Input
                  id="contact_number"
                  name="contact_number"
                  value={newSale.contact_number}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={newSale.quantity || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rate" className="text-right">Rate</Label>
                <Input
                  id="rate"
                  name="rate"
                  type="number"
                  value={newSale.rate || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="total_amount" className="text-right">Total Amount</Label>
                <Input
                  id="total_amount"
                  name="total_amount"
                  type="number"
                  value={newSale.total_amount || ''}
                  readOnly
                  className="col-span-3 bg-muted"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount_received" className="text-right">Amount Received</Label>
                <Input
                  id="amount_received"
                  name="amount_received"
                  type="number"
                  value={newSale.amount_received || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="balance_due" className="text-right">Balance Due</Label>
                <Input
                  id="balance_due"
                  name="balance_due"
                  type="number"
                  value={newSale.balance_due || ''}
                  readOnly
                  className="col-span-3 bg-muted"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment_due_date" className="text-right">Payment Due Date</Label>
                <Input
                  id="payment_due_date"
                  name="payment_due_date"
                  type="date"
                  value={newSale.payment_due_date || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment_frequency" className="text-right">Payment Frequency</Label>
                <Select
                  value={newSale.payment_frequency}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One Time</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddSale}>Add Sale</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {transaction.sales.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No sales added yet. Click "Add Sale" to add your first sale.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transaction.sales.map((sale) => (
            <Card key={sale.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{sale.buyer_name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(sale)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(sale)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{sale.contact_number}</p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quantity:</span>
                    <span className="text-sm font-medium">{sale.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rate:</span>
                    <span className="text-sm font-medium">{formatCurrency(sale.rate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Amount:</span>
                    <span className="text-sm font-medium">{formatCurrency(sale.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount Received:</span>
                    <span className="text-sm font-medium">{formatCurrency(sale.amount_received)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Balance Due:</span>
                    <span className="text-sm font-medium">{formatCurrency(sale.balance_due)}</span>
                  </div>
                  {sale.payment_due_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Due Date:</span>
                      <span className="text-sm font-medium">{new Date(sale.payment_due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment Frequency:</span>
                    <span className="text-sm font-medium capitalize">{sale.payment_frequency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_buyer_name" className="text-right">Buyer Name</Label>
                <Input
                  id="edit_buyer_name"
                  name="buyer_name"
                  value={selectedSale.buyer_name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_contact_number" className="text-right">Contact Number</Label>
                <Input
                  id="edit_contact_number"
                  name="contact_number"
                  value={selectedSale.contact_number}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_quantity" className="text-right">Quantity</Label>
                <Input
                  id="edit_quantity"
                  name="quantity"
                  type="number"
                  value={selectedSale.quantity || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_rate" className="text-right">Rate</Label>
                <Input
                  id="edit_rate"
                  name="rate"
                  type="number"
                  value={selectedSale.rate || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_total_amount" className="text-right">Total Amount</Label>
                <Input
                  id="edit_total_amount"
                  name="total_amount"
                  type="number"
                  value={selectedSale.total_amount || ''}
                  readOnly
                  className="col-span-3 bg-muted"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_amount_received" className="text-right">Amount Received</Label>
                <Input
                  id="edit_amount_received"
                  name="amount_received"
                  type="number"
                  value={selectedSale.amount_received || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_balance_due" className="text-right">Balance Due</Label>
                <Input
                  id="edit_balance_due"
                  name="balance_due"
                  type="number"
                  value={selectedSale.balance_due || ''}
                  readOnly
                  className="col-span-3 bg-muted"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_payment_due_date" className="text-right">Payment Due Date</Label>
                <Input
                  id="edit_payment_due_date"
                  name="payment_due_date"
                  type="date"
                  value={selectedSale.payment_due_date || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_payment_frequency" className="text-right">Payment Frequency</Label>
                <Select
                  value={selectedSale.payment_frequency || 'one-time'}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One Time</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSale}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sale</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this sale? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSale}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesContent;
