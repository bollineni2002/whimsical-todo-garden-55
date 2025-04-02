
import React, { useState } from 'react';
import { Transaction, Supplier } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { dbManager } from '@/lib/db';
import { useCurrency } from '@/context/CurrencyContext';
import { generateId } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MultipleSuppliersContentProps {
  suppliers: Supplier[];
  transaction: Transaction;
  refreshTransaction: () => Promise<void>;
}

const MultipleSuppliersContent: React.FC<MultipleSuppliersContentProps> = ({ suppliers = [], transaction, refreshTransaction }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  const [newSupplier, setNewSupplier] = useState<Supplier>({
    name: '',
    contact: '',
    goodsName: '',
    quantity: 0,
    purchaseRate: 0,
    totalCost: 0,
    amountPaid: 0,
    balance: 0
  });
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  // Toggle the expanded/collapsed state for a supplier card
  const toggleOpen = (index: number) => {
    setOpenItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, supplier: Supplier, setterFn: (s: Supplier) => void) => {
    const { name, value } = e.target;
    let newValue: string | number = value;
    
    // Convert numeric fields to numbers
    if (['quantity', 'purchaseRate', 'totalCost', 'amountPaid', 'balance'].includes(name)) {
      newValue = parseFloat(value) || 0;
      
      // Auto-calculate totalCost when quantity or purchaseRate changes
      if (name === 'quantity' || name === 'purchaseRate') {
        const quantity = name === 'quantity' ? parseFloat(value) || 0 : supplier.quantity;
        const purchaseRate = name === 'purchaseRate' ? parseFloat(value) || 0 : supplier.purchaseRate;
        const totalCost = quantity * purchaseRate;
        
        setterFn({
          ...supplier,
          [name]: newValue as number,
          totalCost,
          balance: totalCost - supplier.amountPaid
        });
        return;
      }
      
      // Auto-calculate balance when amountPaid changes
      if (name === 'amountPaid') {
        const amountPaidValue = parseFloat(value) || 0;
        const balance = supplier.totalCost - amountPaidValue;
        setterFn({
          ...supplier,
          amountPaid: amountPaidValue,
          balance
        });
        return;
      }
    }
    
    setterFn({
      ...supplier,
      [name]: newValue
    });
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name) {
      toast({
        title: "Error",
        description: "Supplier name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedSuppliers = [...suppliers, newSupplier];
      
      // Create a new transaction object with updated suppliers array
      const updatedTransaction = {
        ...transaction,
        suppliers: updatedSuppliers,
      };
      
      await dbManager.updateTransaction(updatedTransaction);
      await refreshTransaction();
      
      setNewSupplier({
        name: '',
        contact: '',
        goodsName: '',
        quantity: 0,
        purchaseRate: 0,
        totalCost: 0,
        amountPaid: 0,
        balance: 0
      });
      setIsAdding(false);
      
      toast({
        title: "Success",
        description: "Supplier added successfully",
      });
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSupplier = async (index: number, supplier: Supplier) => {
    try {
      const updatedSuppliers = [...suppliers];
      updatedSuppliers[index] = supplier;
      
      // Create a new transaction object with updated suppliers array
      const updatedTransaction = {
        ...transaction,
        suppliers: updatedSuppliers,
      };
      
      await dbManager.updateTransaction(updatedTransaction);
      await refreshTransaction();
      setEditingIndex(null);
      
      toast({
        title: "Success",
        description: "Supplier updated successfully",
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSupplier = async (index: number) => {
    try {
      const updatedSuppliers = [...suppliers];
      updatedSuppliers.splice(index, 1);
      
      // Create a new transaction object with updated suppliers array
      const updatedTransaction = {
        ...transaction,
        suppliers: updatedSuppliers,
      };
      
      await dbManager.updateTransaction(updatedTransaction);
      await refreshTransaction();
      
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Suppliers</h2>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Supplier
        </Button>
      </div>

      {isAdding && (
        <Card className="border border-dashed mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Add New Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="name">Supplier Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={newSupplier.name} 
                  onChange={(e) => handleChange(e, newSupplier, setNewSupplier)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Information</Label>
                <Input 
                  id="contact" 
                  name="contact" 
                  value={newSupplier.contact} 
                  onChange={(e) => handleChange(e, newSupplier, setNewSupplier)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goodsName">Goods Name</Label>
                <Input 
                  id="goodsName" 
                  name="goodsName" 
                  value={newSupplier.goodsName} 
                  onChange={(e) => handleChange(e, newSupplier, setNewSupplier)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity" 
                  name="quantity" 
                  type="number" 
                  value={newSupplier.quantity} 
                  onChange={(e) => handleChange(e, newSupplier, setNewSupplier)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseRate">Purchase Rate (/unit)</Label>
                <Input 
                  id="purchaseRate" 
                  name="purchaseRate" 
                  type="number" 
                  value={newSupplier.purchaseRate} 
                  onChange={(e) => handleChange(e, newSupplier, setNewSupplier)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalCost">Total Cost</Label>
                <Input 
                  id="totalCost" 
                  name="totalCost" 
                  type="number" 
                  value={newSupplier.totalCost} 
                  onChange={(e) => handleChange(e, newSupplier, setNewSupplier)}
                  readOnly 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Amount Paid</Label>
                <Input 
                  id="amountPaid" 
                  name="amountPaid" 
                  type="number" 
                  value={newSupplier.amountPaid} 
                  onChange={(e) => handleChange(e, newSupplier, setNewSupplier)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Balance</Label>
                <Input 
                  id="balance" 
                  name="balance" 
                  type="number" 
                  value={newSupplier.balance} 
                  onChange={(e) => handleChange(e, newSupplier, setNewSupplier)}
                  readOnly 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewSupplier({
                  name: '',
                  contact: '',
                  goodsName: '',
                  quantity: 0,
                  purchaseRate: 0,
                  totalCost: 0,
                  amountPaid: 0,
                  balance: 0
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSupplier}>
              Add Supplier
            </Button>
          </CardFooter>
        </Card>
      )}

      {suppliers.length > 0 ? (
        <div className="space-y-4">
          {suppliers.map((supplier, index) => (
            <Collapsible
              key={`supplier-${index}`}
              open={openItems[index]}
              onOpenChange={() => toggleOpen(index)}
            >
              <Card className="border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center hover:text-primary transition-colors w-full text-left">
                      {openItems[index] ? (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2" />
                      )}
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    </CollapsibleTrigger>
                    <div className="flex space-x-2">
                      {editingIndex === index ? (
                        <>
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingIndex(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => handleUpdateSupplier(index, supplier)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingIndex(index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSupplier(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {supplier.goodsName} - {supplier.quantity} units
                  </CardDescription>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent>
                    {editingIndex === index ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`name-${index}`}>Supplier Name</Label>
                          <Input 
                            id={`name-${index}`} 
                            name="name" 
                            value={supplier.name} 
                            onChange={(e) => {
                              const updatedSuppliers = [...suppliers];
                              handleChange(e, supplier, (updated) => {
                                updatedSuppliers[index] = updated;
                                refreshTransaction();
                              });
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`contact-${index}`}>Contact Information</Label>
                          <Input 
                            id={`contact-${index}`} 
                            name="contact" 
                            value={supplier.contact} 
                            onChange={(e) => {
                              const updatedSuppliers = [...suppliers];
                              handleChange(e, supplier, (updated) => {
                                updatedSuppliers[index] = updated;
                                refreshTransaction();
                              });
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`goodsName-${index}`}>Goods Name</Label>
                          <Input 
                            id={`goodsName-${index}`} 
                            name="goodsName" 
                            value={supplier.goodsName} 
                            onChange={(e) => {
                              const updatedSuppliers = [...suppliers];
                              handleChange(e, supplier, (updated) => {
                                updatedSuppliers[index] = updated;
                                refreshTransaction();
                              });
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                          <Input 
                            id={`quantity-${index}`} 
                            name="quantity" 
                            type="number" 
                            value={supplier.quantity} 
                            onChange={(e) => {
                              const updatedSuppliers = [...suppliers];
                              handleChange(e, supplier, (updated) => {
                                updatedSuppliers[index] = updated;
                                refreshTransaction();
                              });
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`purchaseRate-${index}`}>Purchase Rate (/unit)</Label>
                          <Input 
                            id={`purchaseRate-${index}`} 
                            name="purchaseRate" 
                            type="number" 
                            value={supplier.purchaseRate} 
                            onChange={(e) => {
                              const updatedSuppliers = [...suppliers];
                              handleChange(e, supplier, (updated) => {
                                updatedSuppliers[index] = updated;
                                refreshTransaction();
                              });
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`totalCost-${index}`}>Total Cost</Label>
                          <Input 
                            id={`totalCost-${index}`} 
                            name="totalCost" 
                            type="number" 
                            value={supplier.totalCost} 
                            readOnly 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`amountPaid-${index}`}>Amount Paid</Label>
                          <Input 
                            id={`amountPaid-${index}`} 
                            name="amountPaid" 
                            type="number" 
                            value={supplier.amountPaid} 
                            onChange={(e) => {
                              const updatedSuppliers = [...suppliers];
                              handleChange(e, supplier, (updated) => {
                                updatedSuppliers[index] = updated;
                                refreshTransaction();
                              });
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`balance-${index}`}>Balance</Label>
                          <Input 
                            id={`balance-${index}`} 
                            name="balance" 
                            type="number" 
                            value={supplier.balance} 
                            readOnly 
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Contact</p>
                          <p className="font-medium">{supplier.contact || 'N/A'}</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Purchase Rate</p>
                          <p className="font-medium">{formatCurrency(supplier.purchaseRate)}/unit</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Quantity</p>
                          <p className="font-medium">{supplier.quantity} units</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Total Cost</p>
                          <p className="font-medium">{formatCurrency(supplier.totalCost)}</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Amount Paid</p>
                          <p className="font-medium">{formatCurrency(supplier.amountPaid)}</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Balance</p>
                          <p className="font-medium">{formatCurrency(supplier.balance)}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-center py-8">
          No suppliers added yet. Click 'Add Supplier' to add one.
        </div>
      )}
    </div>
  );
};

export default MultipleSuppliersContent;
