import { useState } from 'react';
import { Purchase, CompleteTransaction } from '@/lib/types';
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

interface PurchasesContentProps {
  transaction: CompleteTransaction;
  refreshTransaction: () => Promise<void>;
}

const PurchasesContent: React.FC<PurchasesContentProps> = ({ transaction, refreshTransaction }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [newPurchase, setNewPurchase] = useState<Omit<Purchase, 'id'>>({
    transaction_id: transaction.transaction.id,
    supplier_name: '',
    contact_number: '',
    goods_name: '',
    quantity: 0,
    rate: 0,
    total_cost: 0,
    amount_paid: 0,
    balance_due: 0,
    payment_frequency: 'one-time'
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (isEditDialogOpen && selectedPurchase) {
      // Handle editing existing purchase
      const updatedPurchase = { ...selectedPurchase };
      
      if (name === 'quantity' || name === 'rate') {
        const quantity = name === 'quantity' ? parseFloat(value) || 0 : selectedPurchase.quantity;
        const rate = name === 'rate' ? parseFloat(value) || 0 : selectedPurchase.rate;
        const totalCost = quantity * rate;
        
        updatedPurchase[name] = parseFloat(value) || 0;
        updatedPurchase.total_cost = totalCost;
        updatedPurchase.balance_due = totalCost - updatedPurchase.amount_paid;
      } else if (name === 'amount_paid') {
        const amountPaid = parseFloat(value) || 0;
        updatedPurchase.amount_paid = amountPaid;
        updatedPurchase.balance_due = updatedPurchase.total_cost - amountPaid;
      } else {
        (updatedPurchase as any)[name] = value;
      }
      
      setSelectedPurchase(updatedPurchase);
    } else {
      // Handle adding new purchase
      if (name === 'quantity' || name === 'rate') {
        const quantity = name === 'quantity' ? parseFloat(value) || 0 : newPurchase.quantity;
        const rate = name === 'rate' ? parseFloat(value) || 0 : newPurchase.rate;
        const totalCost = quantity * rate;
        
        setNewPurchase(prev => ({
          ...prev,
          [name]: parseFloat(value) || 0,
          total_cost: totalCost,
          balance_due: totalCost - prev.amount_paid
        }));
      } else if (name === 'amount_paid') {
        const amountPaid = parseFloat(value) || 0;
        setNewPurchase(prev => ({
          ...prev,
          amount_paid: amountPaid,
          balance_due: prev.total_cost - amountPaid
        }));
      } else {
        setNewPurchase(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSelectChange = (value: string) => {
    if (isEditDialogOpen && selectedPurchase) {
      setSelectedPurchase(prev => ({
        ...prev,
        payment_frequency: value as 'one-time' | 'weekly' | 'monthly' | 'quarterly'
      }));
    } else {
      setNewPurchase(prev => ({
        ...prev,
        payment_frequency: value as 'one-time' | 'weekly' | 'monthly' | 'quarterly'
      }));
    }
  };

  const handleAddPurchase = async () => {
    try {
      if (!newPurchase.supplier_name || !newPurchase.goods_name) {
        toast({
          title: 'Validation Error',
          description: 'Supplier name and goods name are required',
          variant: 'destructive'
        });
        return;
      }

      await transactionService.addPurchase(newPurchase);
      await refreshTransaction();
      
      setNewPurchase({
        transaction_id: transaction.transaction.id,
        supplier_name: '',
        contact_number: '',
        goods_name: '',
        quantity: 0,
        rate: 0,
        total_cost: 0,
        amount_paid: 0,
        balance_due: 0,
        payment_frequency: 'one-time'
      });
      
      setIsAddDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Purchase added successfully'
      });
    } catch (error) {
      console.error('Error adding purchase:', error);
      toast({
        title: 'Error',
        description: 'Failed to add purchase',
        variant: 'destructive'
      });
    }
  };

  const handleEditPurchase = async () => {
    try {
      if (!selectedPurchase) return;
      
      if (!selectedPurchase.supplier_name || !selectedPurchase.goods_name) {
        toast({
          title: 'Validation Error',
          description: 'Supplier name and goods name are required',
          variant: 'destructive'
        });
        return;
      }

      await transactionService.updatePurchase(selectedPurchase);
      await refreshTransaction();
      
      setSelectedPurchase(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Purchase updated successfully'
      });
    } catch (error) {
      console.error('Error updating purchase:', error);
      toast({
        title: 'Error',
        description: 'Failed to update purchase',
        variant: 'destructive'
      });
    }
  };

  const handleDeletePurchase = async () => {
    try {
      if (!selectedPurchase) return;

      await transactionService.deletePurchase(selectedPurchase.id);
      await refreshTransaction();
      
      setSelectedPurchase(null);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Purchase deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete purchase',
        variant: 'destructive'
      });
    }
  };

  const openEditDialog = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Purchases</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Purchase
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Purchase</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplier_name" className="text-right">Supplier Name</Label>
                <Input
                  id="supplier_name"
                  name="supplier_name"
                  value={newPurchase.supplier_name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact_number" className="text-right">Contact Number</Label>
                <Input
                  id="contact_number"
                  name="contact_number"
                  value={newPurchase.contact_number}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="goods_name" className="text-right">Goods Name</Label>
                <Input
                  id="goods_name"
                  name="goods_name"
                  value={newPurchase.goods_name}
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
                  value={newPurchase.quantity || ''}
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
                  value={newPurchase.rate || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="total_cost" className="text-right">Total Cost</Label>
                <Input
                  id="total_cost"
                  name="total_cost"
                  type="number"
                  value={newPurchase.total_cost || ''}
                  readOnly
                  className="col-span-3 bg-muted"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount_paid" className="text-right">Amount Paid</Label>
                <Input
                  id="amount_paid"
                  name="amount_paid"
                  type="number"
                  value={newPurchase.amount_paid || ''}
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
                  value={newPurchase.balance_due || ''}
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
                  value={newPurchase.payment_due_date || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment_frequency" className="text-right">Payment Frequency</Label>
                <Select
                  value={newPurchase.payment_frequency}
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
              <Button onClick={handleAddPurchase}>Add Purchase</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {transaction.purchases.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No purchases added yet. Click "Add Purchase" to add your first purchase.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transaction.purchases.map((purchase) => (
            <Card key={purchase.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{purchase.supplier_name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(purchase)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(purchase)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{purchase.contact_number}</p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Goods:</span>
                    <span className="text-sm font-medium">{purchase.goods_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quantity:</span>
                    <span className="text-sm font-medium">{purchase.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rate:</span>
                    <span className="text-sm font-medium">{formatCurrency(purchase.rate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Cost:</span>
                    <span className="text-sm font-medium">{formatCurrency(purchase.total_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount Paid:</span>
                    <span className="text-sm font-medium">{formatCurrency(purchase.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Balance Due:</span>
                    <span className="text-sm font-medium">{formatCurrency(purchase.balance_due)}</span>
                  </div>
                  {purchase.payment_due_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Due Date:</span>
                      <span className="text-sm font-medium">{new Date(purchase.payment_due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment Frequency:</span>
                    <span className="text-sm font-medium capitalize">{purchase.payment_frequency}</span>
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
            <DialogTitle>Edit Purchase</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_supplier_name" className="text-right">Supplier Name</Label>
                <Input
                  id="edit_supplier_name"
                  name="supplier_name"
                  value={selectedPurchase.supplier_name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_contact_number" className="text-right">Contact Number</Label>
                <Input
                  id="edit_contact_number"
                  name="contact_number"
                  value={selectedPurchase.contact_number}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_goods_name" className="text-right">Goods Name</Label>
                <Input
                  id="edit_goods_name"
                  name="goods_name"
                  value={selectedPurchase.goods_name}
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
                  value={selectedPurchase.quantity || ''}
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
                  value={selectedPurchase.rate || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_total_cost" className="text-right">Total Cost</Label>
                <Input
                  id="edit_total_cost"
                  name="total_cost"
                  type="number"
                  value={selectedPurchase.total_cost || ''}
                  readOnly
                  className="col-span-3 bg-muted"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_amount_paid" className="text-right">Amount Paid</Label>
                <Input
                  id="edit_amount_paid"
                  name="amount_paid"
                  type="number"
                  value={selectedPurchase.amount_paid || ''}
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
                  value={selectedPurchase.balance_due || ''}
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
                  value={selectedPurchase.payment_due_date || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_payment_frequency" className="text-right">Payment Frequency</Label>
                <Select
                  value={selectedPurchase.payment_frequency || 'one-time'}
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
            <Button onClick={handleEditPurchase}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Purchase</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this purchase? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeletePurchase}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchasesContent;
