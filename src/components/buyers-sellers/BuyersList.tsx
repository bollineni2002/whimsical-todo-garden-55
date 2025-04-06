import React, { useState, useEffect } from 'react';
import { Buyer } from '@/lib/types';
import { dbService } from '@/lib/db-service';
import { supabaseService } from '@/lib/supabase-service';
import { syncService } from '@/lib/sync-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
import ForceBuyerSellerSync from './ForceBuyerSellerSync';
import CheckSupabaseConnection from '@/components/common/CheckSupabaseConnection';

const BuyersList: React.FC = () => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBuyers, setFilteredBuyers] = useState<Buyer[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [newBuyer, setNewBuyer] = useState<Omit<Buyer, 'id'>>({
    user_id: '',
    name: '',
    email: '',
    phone: '',
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadBuyers();
  }, [user]);

  useEffect(() => {
    if (buyers.length > 0) {
      filterBuyers();
    } else {
      setFilteredBuyers([]);
    }
  }, [buyers, searchQuery]);

  const loadBuyers = async () => {
    if (!user?.id) return;

    console.log('Loading buyers for user:', user.id);
    try {
      setLoading(true);
      const data = await dbService.getBuyersByUser(user.id);
      console.log('Loaded buyers from local database:', data.length);
      setBuyers(data);
    } catch (error) {
      console.error('Failed to load buyers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load buyers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBuyers = () => {
    if (!searchQuery.trim()) {
      setFilteredBuyers(buyers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = buyers.filter(
      buyer =>
        buyer.name.toLowerCase().includes(query) ||
        (buyer.email && buyer.email.toLowerCase().includes(query)) ||
        (buyer.phone && buyer.phone.toLowerCase().includes(query))
    );
    setFilteredBuyers(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (isEditDialogOpen && selectedBuyer) {
      setSelectedBuyer({
        ...selectedBuyer,
        [name]: value,
      });
    } else {
      setNewBuyer({
        ...newBuyer,
        [name]: value,
      });
    }
  };

  const handleAddBuyer = async () => {
    // Add a direct alert to confirm the function is being called
    alert('Adding new buyer - check console for logs');
    console.log('handleAddBuyer called');
    if (!user?.id) {
      console.log('No user ID, returning');
      return;
    }

    try {
      console.log('Adding new buyer:', newBuyer);
      if (!newBuyer.name) {
        toast({
          title: 'Validation Error',
          description: 'Buyer name is required',
          variant: 'destructive',
        });
        return;
      }

      const buyerToAdd = {
        ...newBuyer,
        user_id: user.id,
      };

      // Add buyer to local database
      const createdBuyer = await dbService.addBuyer(buyerToAdd);
      console.log('Added buyer to local database:', createdBuyer);

      // DIRECT SUPABASE INSERT - Bypass the service layer for testing
      if (navigator.onLine) {
        try {
          // Import the Supabase client directly
          const { supabaseSimple } = await import('@/integrations/supabase/simple-client');

          console.log('Attempting direct Supabase insert for buyer:', createdBuyer);

          // First check if the buyer already exists
          const { data: existingBuyer, error: checkError } = await supabaseSimple
            .from('buyers')
            .select('id')
            .eq('id', createdBuyer.id)
            .maybeSingle();

          if (checkError) {
            console.error('Error checking if buyer exists:', checkError);
          }

          if (!existingBuyer) {
            // Prepare the buyer data with created_at
            const buyerData = {
              ...createdBuyer,
              created_at: new Date().toISOString()
            };

            // Direct insert to Supabase
            const { data, error } = await supabaseSimple
              .from('buyers')
              .insert(buyerData)
              .select();

            if (error) {
              console.error('Error in direct Supabase insert:', error);
              alert('Error syncing to Supabase: ' + error.message);
            } else {
              console.log('Direct Supabase insert successful:', data);
              alert('Successfully synced buyer to Supabase!');
            }
          } else {
            console.log('Buyer already exists in Supabase');
          }
        } catch (directError) {
          console.error('Error in direct Supabase operation:', directError);
          alert('Error in direct Supabase operation: ' + (directError as Error).message);
        }

        // Also try the normal sync methods
        try {
          console.log('Attempting to sync buyer to Supabase via service:', createdBuyer);
          const result = await supabaseService.createBuyer(createdBuyer);
          if (result) {
            console.log('Successfully synced buyer to Supabase via service:', result);
          } else {
            console.error('Failed to sync buyer to Supabase via service, result was null');
            // Try using the forceSyncContacts method as a fallback
            console.log('Trying forceSyncContacts as fallback...');
            await syncService.forceSyncContacts(user.id);
          }
        } catch (error) {
          console.error('Error syncing buyer to Supabase via service:', error);
          // Try using the syncBuyers method as a fallback
          try {
            console.log('Trying syncBuyers as fallback...');
            await syncService.syncBuyers(user.id);
          } catch (syncError) {
            console.error('Error in syncBuyers fallback:', syncError);
          }
        }
      }
      await loadBuyers();

      setIsAddDialogOpen(false);
      setNewBuyer({
        user_id: user.id,
        name: '',
        email: '',
        phone: '',
      });

      toast({
        title: 'Success',
        description: 'Buyer added successfully',
      });
    } catch (error) {
      console.error('Error adding buyer:', error);
      toast({
        title: 'Error',
        description: 'Failed to add buyer',
        variant: 'destructive',
      });
    }
  };

  const handleEditBuyer = async () => {
    if (!selectedBuyer) return;

    // Add an alert to confirm the function is being called
    alert('Editing buyer - check console for logs');
    console.log('handleEditBuyer called for buyer:', selectedBuyer);

    try {
      if (!selectedBuyer.name) {
        toast({
          title: 'Validation Error',
          description: 'Buyer name is required',
          variant: 'destructive',
        });
        return;
      }

      // Update buyer in local database
      await dbService.updateBuyer(selectedBuyer);
      console.log('Updated buyer in local database:', selectedBuyer);

      // If online, also update in Supabase
      if (navigator.onLine) {
        // DIRECT SUPABASE UPDATE - Bypass the service layer for testing
        try {
          // Import the Supabase client directly
          const { supabaseSimple } = await import('@/integrations/supabase/simple-client');

          console.log('Attempting direct Supabase update for buyer:', selectedBuyer);

          // Prepare the buyer data
          const buyerData = {
            ...selectedBuyer,
            // Make sure created_at is present
            created_at: selectedBuyer.created_at || new Date().toISOString()
          };

          // Direct upsert to Supabase
          const { data, error } = await supabaseSimple
            .from('buyers')
            .upsert(buyerData)
            .select();

          if (error) {
            console.error('Error in direct Supabase update:', error);
            alert('Error updating in Supabase: ' + error.message);
          } else {
            console.log('Direct Supabase update successful:', data);
            alert('Successfully updated buyer in Supabase!');
          }
        } catch (directError) {
          console.error('Error in direct Supabase operation:', directError);
          alert('Error in direct Supabase operation: ' + (directError as Error).message);
        }

        // Also try the normal service methods
        try {
          console.log('Attempting to update buyer in Supabase via service:', selectedBuyer);
          const result = await supabaseService.updateBuyer(selectedBuyer);
          if (result) {
            console.log('Successfully updated buyer in Supabase via service:', result);
          } else {
            console.error('Failed to update buyer in Supabase via service, result was null');
            // Try using the forceSyncContacts method as a fallback
            console.log('Trying forceSyncContacts as fallback...');
            await syncService.forceSyncContacts(user.id);
          }
        } catch (error) {
          console.error('Error syncing updated buyer to Supabase via service:', error);
          // Try using the syncBuyers method as a fallback
          try {
            console.log('Trying syncBuyers as fallback...');
            await syncService.syncBuyers(user.id);
          } catch (syncError) {
            console.error('Error in syncBuyers fallback:', syncError);
          }
        }
      }
      await loadBuyers();

      setIsEditDialogOpen(false);
      setSelectedBuyer(null);

      toast({
        title: 'Success',
        description: 'Buyer updated successfully',
      });
    } catch (error) {
      console.error('Error updating buyer:', error);
      toast({
        title: 'Error',
        description: 'Failed to update buyer',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBuyer = async () => {
    if (!selectedBuyer) return;

    // Add an alert to confirm the function is being called
    alert('Deleting buyer - check console for logs');
    console.log('handleDeleteBuyer called for buyer:', selectedBuyer.id);

    try {
      // Delete buyer from local database
      await dbService.deleteBuyer(selectedBuyer.id);
      console.log('Deleted buyer from local database:', selectedBuyer.id);

      // If online, also delete from Supabase
      if (navigator.onLine) {
        // DIRECT SUPABASE DELETE - Bypass the service layer for testing
        try {
          // Import the Supabase client directly
          const { supabaseSimple } = await import('@/integrations/supabase/simple-client');

          console.log('Attempting direct Supabase delete for buyer:', selectedBuyer.id);

          // Direct delete from Supabase
          const { error } = await supabaseSimple
            .from('buyers')
            .delete()
            .eq('id', selectedBuyer.id);

          if (error) {
            console.error('Error in direct Supabase delete:', error);
            alert('Error deleting from Supabase: ' + error.message);
          } else {
            console.log('Direct Supabase delete successful');
            alert('Successfully deleted buyer from Supabase!');
          }
        } catch (directError) {
          console.error('Error in direct Supabase operation:', directError);
          alert('Error in direct Supabase operation: ' + (directError as Error).message);
        }

        // Also try the normal service method
        try {
          console.log('Attempting to delete buyer from Supabase via service:', selectedBuyer.id);
          const result = await supabaseService.deleteBuyer(selectedBuyer.id);
          if (result) {
            console.log('Successfully deleted buyer from Supabase via service:', selectedBuyer.id);
          } else {
            console.error('Failed to delete buyer from Supabase via service');
          }
        } catch (error) {
          console.error('Error syncing deleted buyer to Supabase via service:', error);
        }
      }
      await loadBuyers();

      setIsDeleteDialogOpen(false);
      setSelectedBuyer(null);

      toast({
        title: 'Success',
        description: 'Buyer deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting buyer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete buyer',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Buyers</h1>
          <ForceBuyerSellerSync
            type="buyers"
            onSyncComplete={loadBuyers}
            className="ml-2"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              alert('Attempting direct sync to Supabase...');
              try {
                if (!user?.id) {
                  alert('No user ID found');
                  return;
                }

                // Get all local buyers
                const localBuyers = await dbService.getBuyersByUser(user.id);
                alert(`Found ${localBuyers.length} local buyers to sync`);

                // Import the Supabase client directly
                const { supabaseSimple } = await import('@/integrations/supabase/simple-client');

                // Try to sync each buyer
                let successCount = 0;
                let errorCount = 0;

                for (const buyer of localBuyers) {
                  try {
                    // Prepare the buyer data with created_at
                    const buyerData = {
                      ...buyer,
                      created_at: buyer.created_at || new Date().toISOString()
                    };

                    // Direct upsert to Supabase
                    const { error } = await supabaseSimple
                      .from('buyers')
                      .upsert(buyerData)
                      .select();

                    if (error) {
                      console.error(`Error syncing buyer ${buyer.id}:`, error);
                      errorCount++;
                    } else {
                      console.log(`Successfully synced buyer ${buyer.id}`);
                      successCount++;
                    }
                  } catch (buyerError) {
                    console.error(`Error processing buyer ${buyer.id}:`, buyerError);
                    errorCount++;
                  }
                }

                alert(`Sync complete: ${successCount} succeeded, ${errorCount} failed`);
                await loadBuyers();
              } catch (error) {
                console.error('Error in direct sync:', error);
                alert('Error in direct sync: ' + (error as Error).message);
              }
            }}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Direct Sync
          </Button>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search buyers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Buyer
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <CheckSupabaseConnection />
      </div>

      {filteredBuyers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {buyers.length === 0
            ? "You haven't added any buyers yet. Click 'Add Buyer' to get started."
            : "No buyers match your search criteria."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBuyers.map((buyer) => (
            <Card key={buyer.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <CardTitle className="text-lg mb-2 sm:mb-0">{buyer.name}</CardTitle>
                  <div className="flex space-x-2 w-full sm:w-auto justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-blue-600"
                      onClick={() => openEditDialog(buyer)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-red-600"
                      onClick={() => openDeleteDialog(buyer)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {buyer.phone && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phone:</span>
                      <span className="text-sm font-medium">{buyer.phone}</span>
                    </div>
                  )}
                  {buyer.email && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="text-sm font-medium">{buyer.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Buyer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Buyer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={newBuyer.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={newBuyer.phone || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newBuyer.email || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBuyer}>Add Buyer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Buyer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Buyer</DialogTitle>
          </DialogHeader>
          {selectedBuyer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit_name"
                  name="name"
                  value={selectedBuyer.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="edit_phone"
                  name="phone"
                  value={selectedBuyer.phone || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit_email"
                  name="email"
                  type="email"
                  value={selectedBuyer.email || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBuyer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Buyer Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Buyer</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this buyer? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBuyer}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyersList;
