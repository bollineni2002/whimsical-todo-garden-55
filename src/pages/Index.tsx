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
import { Users, UserPlus, LineChart, Plus, Calculator, Briefcase, ListChecks, Edit, Trash2, Percent, Landmark, Replace } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

import PersistentDailyTransactionsLog from '@/components/tab-contents/PersistentDailyTransactionsLog';
import TaxCalculator from '@/components/calculations/TaxCalculator';
import InterestCalculator from '@/components/calculations/InterestCalculator';
import CurrencyConverter from '@/components/calculations/CurrencyConverter';

import { dbService } from '@/lib/db-service';
import { supabaseService } from '@/lib/supabase-service';

import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import ForceBuyerSellerSync from '@/components/buyers-sellers/ForceBuyerSellerSync';

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
  const [businessName, setBusinessName] = useState('TransactLy');
  const [isBuyerDialogOpen, setIsBuyerDialogOpen] = useState(false);
  const [isSellerDialogOpen, setIsSellerDialogOpen] = useState(false);
  const [isEditBuyerDialogOpen, setIsEditBuyerDialogOpen] = useState(false);
  const [isDeleteBuyerDialogOpen, setIsDeleteBuyerDialogOpen] = useState(false);
  const [isEditSellerDialogOpen, setIsEditSellerDialogOpen] = useState(false);
  const [isDeleteSellerDialogOpen, setIsDeleteSellerDialogOpen] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [clientsLoading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newBuyer, setNewBuyer] = useState({ name: '', email: '', phone: '' });
  const [newSeller, setNewSeller] = useState({ name: '', email: '', phone: '' });
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isTransactionLogOpen, setIsTransactionLogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeCalcTab, setActiveCalcTab] = useState('tax');
  const [activeClientTab, setActiveClientTab] = useState('buyers');
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

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
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load buyers from IndexedDB
      console.log('Loading buyers from IndexedDB...');
      const buyersData = await dbService.getBuyersByUser(user.id);
      console.log(`Loaded ${buyersData.length} buyers from IndexedDB`);
      setBuyers(buyersData);

      // Load sellers from IndexedDB
      console.log('Loading sellers from IndexedDB...');
      const sellersData = await dbService.getSellersByUser(user.id);
      console.log(`Loaded ${sellersData.length} sellers from IndexedDB`);
      setSellers(sellersData);

      // Also load from localStorage for backward compatibility
      try {
        const savedBuyers = await localStorage.getItem('buyers');
        const savedSellers = await localStorage.getItem('sellers');

        // If we have buyers in localStorage but not in IndexedDB, migrate them
        if (savedBuyers && buyersData.length === 0) {
          const localBuyers = JSON.parse(savedBuyers);
          console.log(`Migrating ${localBuyers.length} buyers from localStorage to IndexedDB`);

          for (const buyer of localBuyers) {
            const buyerToAdd = {
              ...buyer,
              user_id: user.id
            };
            await dbService.addBuyer(buyerToAdd);
          }

          // Reload buyers after migration
          const updatedBuyers = await dbService.getBuyersByUser(user.id);
          setBuyers(updatedBuyers);
        }

        // If we have sellers in localStorage but not in IndexedDB, migrate them
        if (savedSellers && sellersData.length === 0) {
          const localSellers = JSON.parse(savedSellers);
          console.log(`Migrating ${localSellers.length} sellers from localStorage to IndexedDB`);

          for (const seller of localSellers) {
            const sellerToAdd = {
              ...seller,
              user_id: user.id
            };
            await dbService.addSeller(sellerToAdd);
          }

          // Reload sellers after migration
          const updatedSellers = await dbService.getSellersByUser(user.id);
          setSellers(updatedSellers);
        }
      } catch (localStorageError) {
        console.error('Error migrating from localStorage:', localStorageError);
      }
    } catch (error) {
      console.error('Failed to load buyers and sellers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contacts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (selectedBuyer) {
      setSelectedBuyer({ ...selectedBuyer, [name]: value });
    } else {
      setNewBuyer(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSellerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (selectedSeller) {
      setSelectedSeller({ ...selectedSeller, [name]: value });
    } else {
      setNewSeller(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddBuyer = async () => {
    if (!user?.id) return;

    try {
      if (!newBuyer.name) {
        toast({
          title: 'Validation Error',
          description: 'Name is required',
          variant: 'destructive',
        });
        return;
      }

      // Add buyer to IndexedDB
      const buyerToAdd = {
        ...newBuyer,
        user_id: user.id,
      };

      console.log('Adding buyer to IndexedDB:', buyerToAdd);
      const createdBuyer = await dbService.addBuyer(buyerToAdd);
      console.log('Added buyer to IndexedDB:', createdBuyer);

      // If online, also add to Supabase
      if (navigator.onLine) {
        try {
          console.log('Syncing new buyer to Supabase...');
          const result = await supabaseService.createBuyer(createdBuyer);
          if (result) {
            console.log('Successfully synced buyer to Supabase:', result);
          } else {
            console.error('Failed to sync buyer to Supabase');
          }
        } catch (syncError) {
          console.error('Error syncing buyer to Supabase:', syncError);
        }
      }

      // Reload buyers
      await loadBuyersAndSellers();

      // Reset form and close dialog
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
    if (!user?.id) return;

    try {
      if (!newSeller.name) {
        toast({
          title: 'Validation Error',
          description: 'Name is required',
          variant: 'destructive',
        });
        return;
      }

      // Add seller to IndexedDB
      const sellerToAdd = {
        ...newSeller,
        user_id: user.id,
      };

      console.log('Adding seller to IndexedDB:', sellerToAdd);
      const createdSeller = await dbService.addSeller(sellerToAdd);
      console.log('Added seller to IndexedDB:', createdSeller);

      // If online, also add to Supabase
      if (navigator.onLine) {
        try {
          console.log('Syncing new seller to Supabase...');
          const result = await supabaseService.createSeller(createdSeller);
          if (result) {
            console.log('Successfully synced seller to Supabase:', result);
          } else {
            console.error('Failed to sync seller to Supabase');
          }
        } catch (syncError) {
          console.error('Error syncing seller to Supabase:', syncError);
        }
      }

      // Reload sellers
      await loadBuyersAndSellers();

      // Reset form and close dialog
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

  const handleEditBuyer = async () => {
    if (!selectedBuyer) return;

    try {
      if (!selectedBuyer.name) {
        toast({
          title: 'Validation Error',
          description: 'Name is required',
          variant: 'destructive',
        });
        return;
      }

      // Update buyer in IndexedDB
      console.log('Updating buyer in IndexedDB:', selectedBuyer);
      await dbService.updateBuyer(selectedBuyer);
      console.log('Updated buyer in IndexedDB');

      // If online, also update in Supabase
      if (navigator.onLine) {
        try {
          console.log('Syncing updated buyer to Supabase...');
          const result = await supabaseService.updateBuyer(selectedBuyer);
          if (result) {
            console.log('Successfully synced updated buyer to Supabase:', result);
          } else {
            console.error('Failed to sync updated buyer to Supabase');
          }
        } catch (syncError) {
          console.error('Error syncing updated buyer to Supabase:', syncError);
        }
      }

      // Reload buyers
      await loadBuyersAndSellers();

      setIsEditBuyerDialogOpen(false);
      setSelectedBuyer(null);

      toast({
        title: 'Success',
        description: 'Buyer updated successfully',
      });
    } catch (error) {
      console.error('Failed to update buyer:', error);
      toast({
        title: 'Error',
        description: 'Failed to update buyer',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBuyer = async () => {
    if (!selectedBuyer) return;

    try {
      // Delete buyer from IndexedDB
      console.log('Deleting buyer from IndexedDB:', selectedBuyer.id);
      await dbService.deleteBuyer(selectedBuyer.id);
      console.log('Deleted buyer from IndexedDB');

      // If online, also delete from Supabase
      if (navigator.onLine) {
        try {
          console.log('Syncing deleted buyer to Supabase...');
          const result = await supabaseService.deleteBuyer(selectedBuyer.id);
          if (result) {
            console.log('Successfully synced deleted buyer to Supabase');
          } else {
            console.error('Failed to sync deleted buyer to Supabase');
          }
        } catch (syncError) {
          console.error('Error syncing deleted buyer to Supabase:', syncError);
        }
      }

      // Reload buyers
      await loadBuyersAndSellers();

      setIsDeleteBuyerDialogOpen(false);
      setSelectedBuyer(null);

      toast({
        title: 'Success',
        description: 'Buyer deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete buyer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete buyer',
        variant: 'destructive',
      });
    }
  };

  const handleEditSeller = async () => {
    if (!selectedSeller) return;

    try {
      if (!selectedSeller.name) {
        toast({
          title: 'Validation Error',
          description: 'Name is required',
          variant: 'destructive',
        });
        return;
      }

      // Update seller in IndexedDB
      console.log('Updating seller in IndexedDB:', selectedSeller);
      await dbService.updateSeller(selectedSeller);
      console.log('Updated seller in IndexedDB');

      // If online, also update in Supabase
      if (navigator.onLine) {
        try {
          console.log('Syncing updated seller to Supabase...');
          const result = await supabaseService.updateSeller(selectedSeller);
          if (result) {
            console.log('Successfully synced updated seller to Supabase:', result);
          } else {
            console.error('Failed to sync updated seller to Supabase');
          }
        } catch (syncError) {
          console.error('Error syncing updated seller to Supabase:', syncError);
        }
      }

      // Reload sellers
      await loadBuyersAndSellers();

      setIsEditSellerDialogOpen(false);
      setSelectedSeller(null);

      toast({
        title: 'Success',
        description: 'Seller updated successfully',
      });
    } catch (error) {
      console.error('Failed to update seller:', error);
      toast({
        title: 'Error',
        description: 'Failed to update seller',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSeller = async () => {
    if (!selectedSeller) return;

    try {
      // Delete seller from IndexedDB
      console.log('Deleting seller from IndexedDB:', selectedSeller.id);
      await dbService.deleteSeller(selectedSeller.id);
      console.log('Deleted seller from IndexedDB');

      // If online, also delete from Supabase
      if (navigator.onLine) {
        try {
          console.log('Syncing deleted seller to Supabase...');
          const result = await supabaseService.deleteSeller(selectedSeller.id);
          if (result) {
            console.log('Successfully synced deleted seller to Supabase');
          } else {
            console.error('Failed to sync deleted seller to Supabase');
          }
        } catch (syncError) {
          console.error('Error syncing deleted seller to Supabase:', syncError);
        }
      }

      // Reload sellers
      await loadBuyersAndSellers();

      setIsDeleteSellerDialogOpen(false);
      setSelectedSeller(null);

      toast({
        title: 'Success',
        description: 'Seller deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete seller:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete seller',
        variant: 'destructive',
      });
    }
  };

  const openEditBuyerDialog = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setIsEditBuyerDialogOpen(true);
  };

  const openDeleteBuyerDialog = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setIsDeleteBuyerDialogOpen(true);
  };

  const openEditSellerDialog = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsEditSellerDialogOpen(true);
  };

  const openDeleteSellerDialog = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsDeleteSellerDialogOpen(true);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'transactions':
        return 'Business Transactions';
      case 'calculations':
        return 'Calculations';
      case 'clients-vendors':
        return 'Clients';
      default:
        return businessName;
    }
  };

  useEffect(() => {
    loadBusinessName();
    if (user?.id) {
      loadBuyersAndSellers();
    }
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col"
    >
      <Header
        onExport={handleExport}
        businessName={getPageTitle()}
      />

      <div className="flex-1 overflow-auto">
        <Tabs
          defaultValue="dashboard"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex flex-col h-[calc(100vh-64px)]"
        >
          <TabsContent value="dashboard" className="container mx-auto px-4 py-4 flex-1 overflow-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
              <div className="w-full md:w-auto">
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

          <TabsContent value="clients-vendors" className="container mx-auto px-4 py-8 flex-1 overflow-auto">
            <Tabs value={activeClientTab} onValueChange={setActiveClientTab} className="w-full">
              <div className="w-full mb-4 flex justify-around items-center bg-muted p-1 rounded-md">
                {[
                  { value: 'buyers', label: 'Buyers', icon: <UserPlus className="h-4 w-4" /> },
                  { value: 'sellers', label: 'Sellers', icon: <Users className="h-4 w-4" /> }
                ].map((tab) => {
                  const isActive = tab.value === activeClientTab;

                  return (
                    <button
                      key={tab.value}
                      onClick={() => setActiveClientTab(tab.value)}
                      className={`flex items-center px-3 py-2 text-sm font-medium ${isActive ? 'text-primary border-b-2 border-primary' : 'text-foreground/80'}`}
                    >
                      {tab.icon}
                      <span className={`${isMobile ? 'mt-1 text-xs' : 'ml-2'} ${isActive || !isMobile ? '' : 'hidden'}`}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Edit Buyer Dialog */}
              <Dialog open={isEditBuyerDialogOpen} onOpenChange={setIsEditBuyerDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Buyer</DialogTitle>
                    <DialogDescription>
                      Update the buyer's information below.
                    </DialogDescription>
                  </DialogHeader>
                  {selectedBuyer && (
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit_name" className="text-right">Name</Label>
                        <Input
                          id="edit_name"
                          name="name"
                          value={selectedBuyer.name}
                          onChange={handleBuyerInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit_email" className="text-right">Email</Label>
                        <Input
                          id="edit_email"
                          name="email"
                          type="email"
                          value={selectedBuyer.email || ''}
                          onChange={handleBuyerInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit_phone" className="text-right">Phone</Label>
                        <Input
                          id="edit_phone"
                          name="phone"
                          value={selectedBuyer.phone || ''}
                          onChange={handleBuyerInputChange}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditBuyerDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditBuyer}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Buyer Dialog */}
              <Dialog open={isDeleteBuyerDialogOpen} onOpenChange={setIsDeleteBuyerDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Buyer</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p>Are you sure you want to delete this buyer?</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteBuyerDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteBuyer}>Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Seller Dialog */}
              <Dialog open={isEditSellerDialogOpen} onOpenChange={setIsEditSellerDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Seller</DialogTitle>
                    <DialogDescription>
                      Update the seller's information below.
                    </DialogDescription>
                  </DialogHeader>
                  {selectedSeller && (
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit_seller_name" className="text-right">Name</Label>
                        <Input
                          id="edit_seller_name"
                          name="name"
                          value={selectedSeller.name}
                          onChange={handleSellerInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit_seller_email" className="text-right">Email</Label>
                        <Input
                          id="edit_seller_email"
                          name="email"
                          type="email"
                          value={selectedSeller.email || ''}
                          onChange={handleSellerInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit_seller_phone" className="text-right">Phone</Label>
                        <Input
                          id="edit_seller_phone"
                          name="phone"
                          value={selectedSeller.phone || ''}
                          onChange={handleSellerInputChange}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditSellerDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSeller}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Seller Dialog */}
              <Dialog open={isDeleteSellerDialogOpen} onOpenChange={setIsDeleteSellerDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Seller</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p>Are you sure you want to delete this seller?</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteSellerDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteSeller}>Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="mt-4">
                {activeClientTab === 'buyers' && (
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <ForceBuyerSellerSync
                        type="buyers"
                        onSyncComplete={loadBuyersAndSellers}
                        className="mt-2 sm:mt-0"
                      />
                    </div>
                    <Dialog open={isBuyerDialogOpen} onOpenChange={setIsBuyerDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Buyer
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {clientsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : buyers.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No buyers added yet. Add your first buyer.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {buyers.map(buyer => (
                          <div key={buyer.id} className="border rounded-lg p-4 hover:bg-accent/5 transition-colors relative">
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
                            <div className="absolute top-2 right-2 flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-blue-600"
                                onClick={() => openEditBuyerDialog(buyer)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600"
                                onClick={() => openDeleteBuyerDialog(buyer)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Dialog open={isBuyerDialogOpen} onOpenChange={setIsBuyerDialogOpen}>
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
                )}

                {activeClientTab === 'sellers' && (
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <ForceBuyerSellerSync
                        type="sellers"
                        onSyncComplete={loadBuyersAndSellers}
                        className="mt-2 sm:mt-0"
                      />
                    </div>
                    <Dialog open={isSellerDialogOpen} onOpenChange={setIsSellerDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Seller
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {clientsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : sellers.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No sellers added yet. Add your first seller.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sellers.map(seller => (
                          <div key={seller.id} className="border rounded-lg p-4 hover:bg-accent/5 transition-colors relative">
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
                            <div className="absolute top-2 right-2 flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-blue-600"
                                onClick={() => openEditSellerDialog(seller)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600"
                                onClick={() => openDeleteSellerDialog(seller)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Dialog open={isSellerDialogOpen} onOpenChange={setIsSellerDialogOpen}>
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
                )}
              </div>
            </Tabs>
          </TabsContent>

          <TabsContent value="transactions" className="container mx-auto px-4 py-8 flex-1 overflow-auto relative">
            <PersistentDailyTransactionsLog
              isFormOpen={isTransactionLogOpen}
              setIsFormOpen={setIsTransactionLogOpen}
              dialogModeRef={{ current: true }}
            />

            <Button
              size="icon"
              className="h-12 w-12 rounded-full fixed bottom-24 right-6 shadow-lg z-10"
              onClick={() => {
                setIsTransactionLogOpen(true);
              }}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </TabsContent>

          <TabsContent value="calculations" className="container mx-auto px-4 py-8 flex-1 overflow-auto">
            <Card>
              <CardContent className="p-0 pt-6">
                <Tabs value={activeCalcTab} onValueChange={setActiveCalcTab} className="w-full">
                  <div className="w-full mb-4 flex justify-around items-center bg-muted p-1 rounded-md">
                    {[
                      { value: 'tax', label: 'Tax', icon: <Percent className="h-4 w-4" /> },
                      { value: 'interest', label: 'Interest', icon: <Landmark className="h-4 w-4" /> },
                      { value: 'currency', label: 'Currency', icon: <Replace className="h-4 w-4" /> }
                    ].map((tab) => {
                      const isActive = tab.value === activeCalcTab;

                      return (
                        <button
                          key={tab.value}
                          onClick={() => setActiveCalcTab(tab.value)}
                          className={`flex items-center px-3 py-2 text-sm font-medium ${isActive ? 'text-primary border-b-2 border-primary' : 'text-foreground/80'}`}
                        >
                          {tab.icon}
                          <span className={`${isMobile ? 'mt-1 text-xs' : 'ml-2'} ${isActive || !isMobile ? '' : 'hidden'}`}>
                            {tab.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4">
                    {activeCalcTab === 'tax' && <TaxCalculator />}
                    {activeCalcTab === 'interest' && <InterestCalculator />}
                    {activeCalcTab === 'currency' && <CurrencyConverter />}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="container mx-auto px-4 py-8 flex-1 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your application preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Business Information</h3>
                    <p className="text-sm text-muted-foreground mb-2">Update your business details</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-auto sticky bottom-0 z-10">
            <TabsList className="w-full bg-background border-t flex justify-between rounded-none">
              <TabsTrigger
                value="dashboard"
                className="flex-1 py-3"
              >
                <div className="flex flex-col items-center">
                  <LineChart className="w-5 h-5" />
                  <span className="text-xs mt-1">Dashboard</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex-1 py-3"
              >
                <div className="flex flex-col items-center">
                  <ListChecks className="w-5 h-5" />
                  <span className="text-xs mt-1">Transactions</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="calculations"
                className="flex-1 py-3"
              >
                <div className="flex flex-col items-center">
                  <Calculator className="w-5 h-5" />
                  <span className="text-xs mt-1">Calculations</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="clients-vendors"
                className="flex-1 py-3"
              >
                <div className="flex flex-col items-center">
                  <Briefcase className="w-5 h-5" />
                  <span className="text-xs mt-1">Clients</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default Index;
