
import React, { useState } from 'react';
import { Transaction, Buyer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { dbManager } from '@/lib/db';
import { useCurrency } from '@/context/CurrencyContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MultipleBuyersContentProps {
  buyers: Buyer[];
  transaction: Transaction;
  refreshTransaction: () => Promise<void>;
}

const MultipleBuyersContent: React.FC<MultipleBuyersContentProps> = ({ buyers = [], transaction, refreshTransaction }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  const [newBuyer, setNewBuyer] = useState<Buyer>({
    name: '',
    contact: '',
    quantitySold: 0,
    saleRate: 0,
    totalSaleAmount: 0,
    amountReceived: 0,
    pendingBalance: 0
  });
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  // Toggle the expanded/collapsed state for a buyer card
  const toggleOpen = (index: number) => {
    setOpenItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, buyer: Buyer, setterFn: (b: Buyer) => void) => {
    const { name, value } = e.target;
    let newValue: string | number = value;
    
    // Convert numeric fields to numbers
    if (['quantitySold', 'saleRate', 'totalSaleAmount', 'amountReceived', 'pendingBalance'].includes(name)) {
      newValue = parseFloat(value) || 0;
      
      // Auto-calculate totalSaleAmount when quantitySold or saleRate changes
      if (name === 'quantitySold' || name === 'saleRate') {
        const quantitySold = name === 'quantitySold' ? parseFloat(value) || 0 : buyer.quantitySold;
        const saleRate = name === 'saleRate' ? parseFloat(value) || 0 : buyer.saleRate;
        const totalSaleAmount = quantitySold * saleRate;
        
        setterFn({
          ...buyer,
          [name]: newValue as number,
          totalSaleAmount,
          pendingBalance: totalSaleAmount - buyer.amountReceived
        });
        return;
      }
      
      // Auto-calculate pendingBalance when amountReceived changes
      if (name === 'amountReceived') {
        const amountReceivedValue = parseFloat(value) || 0;
        const pendingBalance = buyer.totalSaleAmount - amountReceivedValue;
        setterFn({
          ...buyer,
          amountReceived: amountReceivedValue,
          pendingBalance
        });
        return;
      }
    }
    
    setterFn({
      ...buyer,
      [name]: newValue
    });
  };

  const handleChangeFrequency = (value: string, buyer: Buyer, setterFn: (b: Buyer) => void) => {
    setterFn({
      ...buyer,
      paymentFrequency: value as 'one-time' | 'weekly' | 'monthly' | 'quarterly'
    });
  };

  const handleAddBuyer = async () => {
    if (!newBuyer.name) {
      toast({
        title: "Error",
        description: "Buyer name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedBuyers = [...buyers, newBuyer];
      
      // Create a new transaction object with updated buyers array
      const updatedTransaction = {
        ...transaction,
        buyers: updatedBuyers,
      };
      
      await dbManager.updateTransaction(updatedTransaction);
      await refreshTransaction();
      
      setNewBuyer({
        name: '',
        contact: '',
        quantitySold: 0,
        saleRate: 0,
        totalSaleAmount: 0,
        amountReceived: 0,
        pendingBalance: 0
      });
      setIsAdding(false);
      
      toast({
        title: "Success",
        description: "Buyer added successfully",
      });
    } catch (error) {
      console.error('Error adding buyer:', error);
      toast({
        title: "Error",
        description: "Failed to add buyer",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBuyer = async (index: number, buyer: Buyer) => {
    try {
      const updatedBuyers = [...buyers];
      updatedBuyers[index] = buyer;
      
      // Create a new transaction object with updated buyers array
      const updatedTransaction = {
        ...transaction,
        buyers: updatedBuyers,
      };
      
      await dbManager.updateTransaction(updatedTransaction);
      await refreshTransaction();
      setEditingIndex(null);
      
      toast({
        title: "Success",
        description: "Buyer updated successfully",
      });
    } catch (error) {
      console.error('Error updating buyer:', error);
      toast({
        title: "Error",
        description: "Failed to update buyer",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBuyer = async (index: number) => {
    try {
      const updatedBuyers = [...buyers];
      updatedBuyers.splice(index, 1);
      
      // Create a new transaction object with updated buyers array
      const updatedTransaction = {
        ...transaction,
        buyers: updatedBuyers,
      };
      
      await dbManager.updateTransaction(updatedTransaction);
      await refreshTransaction();
      
      toast({
        title: "Success",
        description: "Buyer deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting buyer:', error);
      toast({
        title: "Error",
        description: "Failed to delete buyer",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Buyers</h2>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Buyer
        </Button>
      </div>

      {isAdding && (
        <Card className="border border-dashed mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Add New Buyer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="name">Buyer Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={newBuyer.name} 
                  onChange={(e) => handleChange(e, newBuyer, setNewBuyer)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Information</Label>
                <Input 
                  id="contact" 
                  name="contact" 
                  value={newBuyer.contact} 
                  onChange={(e) => handleChange(e, newBuyer, setNewBuyer)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantitySold">Quantity Sold</Label>
                <Input 
                  id="quantitySold" 
                  name="quantitySold" 
                  type="number" 
                  value={newBuyer.quantitySold} 
                  onChange={(e) => handleChange(e, newBuyer, setNewBuyer)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="saleRate">Sale Rate (/unit)</Label>
                <Input 
                  id="saleRate" 
                  name="saleRate" 
                  type="number" 
                  value={newBuyer.saleRate} 
                  onChange={(e) => handleChange(e, newBuyer, setNewBuyer)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalSaleAmount">Total Sale Amount</Label>
                <Input 
                  id="totalSaleAmount" 
                  name="totalSaleAmount" 
                  type="number" 
                  value={newBuyer.totalSaleAmount} 
                  onChange={(e) => handleChange(e, newBuyer, setNewBuyer)}
                  readOnly 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountReceived">Amount Received</Label>
                <Input 
                  id="amountReceived" 
                  name="amountReceived" 
                  type="number" 
                  value={newBuyer.amountReceived} 
                  onChange={(e) => handleChange(e, newBuyer, setNewBuyer)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pendingBalance">Pending Balance</Label>
                <Input 
                  id="pendingBalance" 
                  name="pendingBalance" 
                  type="number" 
                  value={newBuyer.pendingBalance} 
                  onChange={(e) => handleChange(e, newBuyer, setNewBuyer)}
                  readOnly 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDueDate">Payment Due Date</Label>
                <Input 
                  id="paymentDueDate" 
                  name="paymentDueDate" 
                  type="date" 
                  value={newBuyer.paymentDueDate || ''} 
                  onChange={(e) => handleChange(e, newBuyer, setNewBuyer)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentFrequency">Payment Frequency</Label>
                <Select 
                  onValueChange={(value) => handleChangeFrequency(value, newBuyer, setNewBuyer)}
                  value={newBuyer.paymentFrequency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
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
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewBuyer({
                  name: '',
                  contact: '',
                  quantitySold: 0,
                  saleRate: 0,
                  totalSaleAmount: 0,
                  amountReceived: 0,
                  pendingBalance: 0
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddBuyer}>
              Add Buyer
            </Button>
          </CardFooter>
        </Card>
      )}

      {buyers.length > 0 ? (
        <div className="space-y-4">
          {buyers.map((buyer, index) => (
            <Collapsible
              key={`buyer-${index}`}
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
                      <CardTitle className="text-lg">{buyer.name}</CardTitle>
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
                            onClick={() => handleUpdateBuyer(index, buyer)}
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
                            onClick={() => handleDeleteBuyer(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {buyer.quantitySold} units at {formatCurrency(buyer.saleRate)}/unit
                  </CardDescription>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent>
                    {editingIndex === index ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`name-${index}`}>Buyer Name</Label>
                          <Input 
                            id={`name-${index}`} 
                            name="name" 
                            value={buyer.name} 
                            onChange={(e) => {
                              const updatedBuyers = [...buyers];
                              handleChange(e, buyer, (updated) => {
                                updatedBuyers[index] = updated;
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
                            value={buyer.contact} 
                            onChange={(e) => {
                              const updatedBuyers = [...buyers];
                              handleChange(e, buyer, (updated) => {
                                updatedBuyers[index] = updated;
                                refreshTransaction();
                              });
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`quantitySold-${index}`}>Quantity Sold</Label>
                          <Input 
                            id={`quantitySold-${index}`} 
                            name="quantitySold" 
                            type="number" 
                            value={buyer.quantitySold} 
                            onChange={(e) => {
                              const updatedBuyers = [...buyers];
                              handleChange(e, buyer, (updated) => {
                                updatedBuyers[index] = updated;
                                refreshTransaction();
                              });
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`saleRate-${index}`}>Sale Rate (/unit)</Label>
                          <Input 
                            id={`saleRate-${index}`} 
                            name="saleRate" 
                            type="number" 
                            value={buyer.saleRate} 
                            onChange={(e) => {
                              const updatedBuyers = [...buyers];
                              handleChange(e, buyer, (updated) => {
                                updatedBuyers[index] = updated;
                                refreshTransaction();
                              });
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`totalSaleAmount-${index}`}>Total Sale Amount</Label>
                          <Input 
                            id={`totalSaleAmount-${index}`} 
                            name="totalSaleAmount" 
                            type="number" 
                            value={buyer.totalSaleAmount} 
                            readOnly 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`amountReceived-${index}`}>Amount Received</Label>
                          <Input 
                            id={`amountReceived-${index}`} 
                            name="amountReceived" 
                            type="number" 
                            value={buyer.amountReceived} 
                            onChange={(e) => {
                              const updatedBuyers = [...buyers];
                              handleChange(e, buyer, (updated) => {
                                updatedBuyers[index] = updated;
                                refreshTransaction();
                              });
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`pendingBalance-${index}`}>Pending Balance</Label>
                          <Input 
                            id={`pendingBalance-${index}`} 
                            name="pendingBalance" 
                            type="number" 
                            value={buyer.pendingBalance} 
                            readOnly 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`paymentDueDate-${index}`}>Payment Due Date</Label>
                          <Input 
                            id={`paymentDueDate-${index}`} 
                            name="paymentDueDate" 
                            type="date" 
                            value={buyer.paymentDueDate || ''} 
                            onChange={(e) => {
                              const updatedBuyers = [...buyers];
                              handleChange(e, buyer, (updated) => {
                                updatedBuyers[index] = updated;
                                refreshTransaction();
                              });
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`paymentFrequency-${index}`}>Payment Frequency</Label>
                          <Select 
                            onValueChange={(value) => {
                              const updatedBuyers = [...buyers];
                              handleChangeFrequency(value, buyer, (updated) => {
                                updatedBuyers[index] = updated;
                                refreshTransaction();
                              });
                            }}
                            value={buyer.paymentFrequency}
                          >
                            <SelectTrigger id={`paymentFrequency-${index}`}>
                              <SelectValue placeholder="Select frequency" />
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
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Contact</p>
                          <p className="font-medium">{buyer.contact || 'N/A'}</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Quantity Sold</p>
                          <p className="font-medium">{buyer.quantitySold} units</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Sale Rate</p>
                          <p className="font-medium">{formatCurrency(buyer.saleRate)}/unit</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Total Sale Amount</p>
                          <p className="font-medium">{formatCurrency(buyer.totalSaleAmount)}</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Amount Received</p>
                          <p className="font-medium">{formatCurrency(buyer.amountReceived)}</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Pending Balance</p>
                          <p className="font-medium">{formatCurrency(buyer.pendingBalance)}</p>
                        </div>
                        
                        {buyer.paymentDueDate && (
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">Payment Due Date</p>
                            <p className="font-medium">{new Date(buyer.paymentDueDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        
                        {buyer.paymentFrequency && (
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">Payment Frequency</p>
                            <p className="font-medium capitalize">{buyer.paymentFrequency}</p>
                          </div>
                        )}
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
          No buyers added yet. Click 'Add Buyer' to add one.
        </div>
      )}
    </div>
  );
};

export default MultipleBuyersContent;
