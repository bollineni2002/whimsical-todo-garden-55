
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom hooks
import { useTransactions } from '@/hooks/useTransactions';

// Components
import Header from '@/components/index/Header';
import SearchBar from '@/components/index/SearchBar';
import CreateTransactionDialog from '@/components/index/CreateTransactionDialog';
import EmptyState from '@/components/index/EmptyState';
import LoadingSpinner from '@/components/index/LoadingSpinner';
import TransactionList from '@/components/index/TransactionList';
import { exportTransactions, ExportFormat } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Import icons for the new section
import { Settings, Users, UserPlus, LineChart, Plus, Calculator, Percent, Landmark, Replace, Briefcase, ListChecks } from 'lucide-react'; // Added Briefcase, ListChecks
import { dbManager } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
// Import placeholder components (will be created next)
import TaxCalculator from '@/components/calculations/TaxCalculator';
import InterestCalculator from '@/components/calculations/InterestCalculator';
import CurrencyConverter from '@/components/calculations/CurrencyConverter';
// Import the new Daily Transactions Log component
import DailyTransactionsLog from '@/components/tab-contents/DailyTransactionsLog';

interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
}

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
}

const Index = () => {
  const { 
    filteredTransactions, 
    loading, 
    searchQuery, 
    setSearchQuery,
    setStatusFilter,
    loadTransactions
  } = useTransactions();
  
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [businessName, setBusinessName] = useState('TransactLy'); // Keep for Header display
  const [isBuyerDialogOpen, setIsBuyerDialogOpen] = useState(false);
  const [isSellerDialogOpen, setIsSellerDialogOpen] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [newBuyer, setNewBuyer] = useState({ name: '', email: '', phone: '' });
  const [newSeller, setNewSeller] = useState({ name: '', email: '', phone: '' });
  const { toast } = useToast();

  const handleExport = async (format: ExportFormat) => {
    try {
      await exportTransactions(filteredTransactions, format);
      toast({
        title: 'Export Successful',
        description: `Transaction data has been exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export transaction data',
        variant: 'destructive',
      });
    }
  };

  const handleFilterChange = (status: string | null) => {
    setStatusFilter(status);
  };

  const loadBusinessName = async () => {
    try {
      const settings = await localStorage.getItem('businessName');
      if (settings) {
        setBusinessName(settings);
      }
    } catch (error) {
      console.error('Failed to load business name:', error);
    }
  };

  const loadBuyersAndSellers = async () => {
    try {
      const savedBuyers = await localStorage.getItem('buyers');
      const savedSellers = await localStorage.getItem('sellers');
      
      if (savedBuyers) {
        setBuyers(JSON.parse(savedBuyers));
      }
      
      if (savedSellers) {
        setSellers(JSON.parse(savedSellers));
      }
    } catch (error) {
      console.error('Failed to load buyers and sellers:', error);
    }
  };

  const handleBuyerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBuyer(prev => ({ ...prev, [name]: value }));
  };

  const handleSellerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSeller(prev => ({ ...prev, [name]: value }));
  };

  const handleAddBuyer = async () => {
    try {
      if (!newBuyer.name || !newBuyer.phone) {
        toast({
          title: 'Validation Error',
          description: 'Name and Phone are required fields',
          variant: 'destructive',
        });
        return;
      }
      
      const newBuyerEntry: Buyer = {
        id: `buyer-${Date.now()}`,
        name: newBuyer.name,
        email: newBuyer.email,
        phone: newBuyer.phone,
        date: new Date().toISOString(),
      };
      
      const updatedBuyers = [...buyers, newBuyerEntry];
      setBuyers(updatedBuyers);
      await localStorage.setItem('buyers', JSON.stringify(updatedBuyers));
      
      setNewBuyer({ name: '', email: '', phone: '' });
      setIsBuyerDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Buyer added successfully',
      });
    } catch (error) {
      console.error('Failed to add buyer:', error);
      toast({
        title: 'Error',
        description: 'Failed to add buyer',
        variant: 'destructive',
      });
    }
  };

  const handleAddSeller = async () => {
    try {
      if (!newSeller.name || !newSeller.phone) {
        toast({
          title: 'Validation Error',
          description: 'Name and Phone are required fields',
          variant: 'destructive',
        });
        return;
      }
      
      const newSellerEntry: Seller = {
        id: `seller-${Date.now()}`,
        name: newSeller.name,
        email: newSeller.email,
        phone: newSeller.phone,
        date: new Date().toISOString(),
      };
      
      const updatedSellers = [...sellers, newSellerEntry];
      setSellers(updatedSellers);
      await localStorage.setItem('sellers', JSON.stringify(updatedSellers));
      
      setNewSeller({ name: '', email: '', phone: '' });
      setIsSellerDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Seller added successfully',
      });
    } catch (error) {
      console.error('Failed to add seller:', error);
      toast({
        title: 'Error',
        description: 'Failed to add seller',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTransaction = () => {
    navigate('/new-transaction');
  };

  useEffect(() => {
    loadBusinessName();
    loadBuyersAndSellers();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col"
    >
      <Header onExport={handleExport} businessName={businessName} /> 
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full max-w-4xl mx-auto mb-6 grid grid-cols-5 overflow-x-auto scrollbar-hide">
          <TabsTrigger 
            value="dashboard"
            icon={<LineChart className="w-4 h-4" />}
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="transactions"
            icon={<ListChecks className="w-4 h-4" />}
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger 
            value="calculations"
            icon={<Calculator className="w-4 h-4" />}
          >
            Calculations
          </TabsTrigger>
          <TabsTrigger 
            value="clients-vendors"
            icon={<Briefcase className="w-4 h-4" />}
          >
            Clients & Vendors
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            icon={<Settings className="w-4 h-4" />}
          >
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="w-full md:w-auto">
              <h2 className="text-xl font-medium mb-2">Recent Transactions</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <SearchBar 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
                <div className="flex space-x-2">
                  <Button 
                    variant={filteredTransactions.length === 0 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleFilterChange(null)}
                  >
                    All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleFilterChange('pending')}
                    className="border-amber-500 text-amber-500 hover:bg-amber-50"
                  >
                    Pending
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleFilterChange('completed')}
                    className="border-green-500 text-green-500 hover:bg-green-50"
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Transaction
                </Button>
              </DialogTrigger>
              <CreateTransactionDialog 
                onTransactionCreated={() => {
                  setIsDialogOpen(false);
                  loadTransactions();
                }} 
              />
            </Dialog>
          </div>
          
          <AnimatePresence>
            {loading ? (
              <LoadingSpinner />
            ) : filteredTransactions.length === 0 ? (
              <EmptyState 
                hasSearchQuery={searchQuery.length > 0}
                onCreateTransaction={handleCreateTransaction}
              />
            ) : (
              <TransactionList 
                transactions={filteredTransactions} 
                loading={loading}
                onRefresh={loadTransactions}
                onCreateTransaction={handleCreateTransaction}
              />
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="clients-vendors" className="container mx-auto px-4 py-8">
          <Tabs defaultValue="buyers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="buyers">
                <UserPlus className="w-4 h-4 mr-2" /> Buyers
              </TabsTrigger>
              <TabsTrigger value="sellers">
                <Users className="w-4 h-4 mr-2" /> Sellers
              </TabsTrigger>
            </TabsList>
            <TabsContent value="buyers">
              <Card>
                <CardHeader>
                  <CardTitle>Buyers Management</CardTitle>
              <CardDescription>Add and manage your buyers in one place</CardDescription>
            </CardHeader>
            <CardContent>
              {buyers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No buyers added yet. Add your first buyer.
                </div>
              ) : (
                <div className="space-y-4">
                  {buyers.map(buyer => (
                    <div key={buyer.id} className="border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <h3 className="font-medium">{buyer.name}</h3>
                          <p className="text-sm text-muted-foreground">{buyer.phone}</p>
                          {buyer.email && <p className="text-sm text-muted-foreground">{buyer.email}</p>}
                        </div>
                        <div className="text-sm text-right mt-2 md:mt-0">
                          <p className="text-muted-foreground">Added on {new Date(buyer.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Dialog open={isBuyerDialogOpen} onOpenChange={setIsBuyerDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Buyer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Buyer</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new buyer to add them to your system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="buyerName" className="text-right">Name</Label>
                      <Input 
                        id="buyerName" 
                        name="name"
                        className="col-span-3" 
                        placeholder="Enter buyer name" 
                        value={newBuyer.name}
                        onChange={handleBuyerInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="buyerEmail" className="text-right">Email</Label>
                      <Input 
                        id="buyerEmail" 
                        name="email"
                        className="col-span-3" 
                        placeholder="Enter buyer email" 
                        value={newBuyer.email}
                        onChange={handleBuyerInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="buyerPhone" className="text-right">Phone</Label>
                      <Input 
                        id="buyerPhone" 
                        name="phone"
                        className="col-span-3" 
                        placeholder="Enter buyer phone" 
                        value={newBuyer.phone}
                        onChange={handleBuyerInputChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBuyerDialogOpen(false)}>Cancel</Button>
                    <Button type="button" onClick={handleAddBuyer}>Add Buyer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="sellers">
              <Card>
                <CardHeader>
                  <CardTitle>Sellers Management</CardTitle>
              <CardDescription>Add and manage your sellers in one place</CardDescription>
            </CardHeader>
            <CardContent>
              {sellers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No sellers added yet. Add your first seller.
                </div>
              ) : (
                <div className="space-y-4">
                  {sellers.map(seller => (
                    <div key={seller.id} className="border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <h3 className="font-medium">{seller.name}</h3>
                          <p className="text-sm text-muted-foreground">{seller.phone}</p>
                          {seller.email && <p className="text-sm text-muted-foreground">{seller.email}</p>}
                        </div>
                        <div className="text-sm text-right mt-2 md:mt-0">
                          <p className="text-muted-foreground">Added on {new Date(seller.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Dialog open={isSellerDialogOpen} onOpenChange={setIsSellerDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Seller
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Seller</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new seller to add them to your system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sellerName" className="text-right">Name</Label>
                      <Input 
                        id="sellerName" 
                        name="name"
                        className="col-span-3" 
                        placeholder="Enter seller name" 
                        value={newSeller.name}
                        onChange={handleSellerInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sellerEmail" className="text-right">Email</Label>
                      <Input 
                        id="sellerEmail" 
                        name="email"
                        className="col-span-3" 
                        placeholder="Enter seller email" 
                        value={newSeller.email}
                        onChange={handleSellerInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sellerPhone" className="text-right">Phone</Label>
                      <Input 
                        id="sellerPhone" 
                        name="phone"
                        className="col-span-3" 
                        placeholder="Enter seller phone" 
                        value={newSeller.phone}
                        onChange={handleSellerInputChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSellerDialogOpen(false)}>Cancel</Button>
                    <Button type="button" onClick={handleAddSeller}>Add Seller</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="transactions" className="container mx-auto px-4 py-8">
          <DailyTransactionsLog />
        </TabsContent>

        <TabsContent value="calculations" className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Calculations</CardTitle>
              <CardDescription>Tools for tax, interest, and currency conversion.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tax" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="tax">
                    <Percent className="w-4 h-4 mr-2" /> Tax
                  </TabsTrigger>
                  <TabsTrigger value="interest">
                    <Landmark className="w-4 h-4 mr-2" /> Interest
                  </TabsTrigger>
                  <TabsTrigger value="currency">
                    <Replace className="w-4 h-4 mr-2" /> Currency
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="tax">
                  <TaxCalculator /> 
                </TabsContent>
                <TabsContent value="interest">
                  <InterestCalculator />
                </TabsContent>
                <TabsContent value="currency">
                  <CurrencyConverter />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
      
    </motion.div>
  );
};

export default Index;
