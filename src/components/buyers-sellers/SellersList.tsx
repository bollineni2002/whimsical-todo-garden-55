import React, { useState, useEffect } from 'react';
import '@/styles/floating-add-button.css';
import { Seller } from '@/lib/types';
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

const SellersList: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [newSeller, setNewSeller] = useState<Omit<Seller, 'id'>>({
    user_id: '',
    name: '',
    email: '',
    phone: '',
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadSellers();
  }, [user]);

  useEffect(() => {
    if (sellers.length > 0) {
      filterSellers();
    } else {
      setFilteredSellers([]);
    }
  }, [sellers, searchQuery]);

  const loadSellers = async () => {
    if (!user?.id) return;

    console.log('Loading sellers for user:', user.id);
    try {
      setLoading(true);
      const data = await dbService.getSellersByUser(user.id);
      console.log('Loaded sellers from local database:', data.length);
      setSellers(data);
    } catch (error) {
      console.error('Failed to load sellers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sellers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSellers = () => {
    if (!searchQuery.trim()) {
      setFilteredSellers(sellers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = sellers.filter(
      seller =>
        seller.name.toLowerCase().includes(query) ||
        (seller.email && seller.email.toLowerCase().includes(query)) ||
        (seller.phone && seller.phone.toLowerCase().includes(query))
    );
    setFilteredSellers(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (isEditDialogOpen && selectedSeller) {
      setSelectedSeller({
        ...selectedSeller,
        [name]: value,
      });
    } else {
      setNewSeller({
        ...newSeller,
        [name]: value,
      });
    }
  };

  const handleAddSeller = async () => {
    if (!user?.id) return;

    try {
      if (!newSeller.name) {
        toast({
          title: 'Validation Error',
          description: 'Seller name is required',
          variant: 'destructive',
        });
        return;
      }

      const sellerToAdd = {
        ...newSeller,
        user_id: user.id,
      };

      // Check for potential duplicates before adding
      console.log('Checking for duplicate sellers...');
      const existingSellers = await dbService.getSellersByUser(user.id);
      const potentialDuplicates = existingSellers.filter(seller =>
        seller.name.toLowerCase() === sellerToAdd.name.toLowerCase() &&
        (seller.phone === sellerToAdd.phone || (!seller.phone && !sellerToAdd.phone)) &&
        (seller.email === sellerToAdd.email || (!seller.email && !sellerToAdd.email))
      );

      if (potentialDuplicates.length > 0) {
        console.log('Found potential duplicate seller:', potentialDuplicates[0]);
        toast({
          title: 'Duplicate Detected',
          description: 'A seller with this name and contact information already exists.',
          variant: 'destructive',
        });
        return;
      }

      // Add seller to local database
      const createdSeller = await dbService.addSeller(sellerToAdd);
      console.log('Added seller to local database:', createdSeller);

      // Automatically sync to Supabase if online
      if (navigator.onLine) {
        try {
          console.log('Automatically syncing new seller to Supabase:', createdSeller);

          // First try the direct service method
          const result = await supabaseService.createSeller(createdSeller);

          if (result) {
            console.log('Successfully synced seller to Supabase:', result);
          } else {
            console.error('Failed to sync seller to Supabase, trying fallback methods');

            // Try using the syncSellers method as a fallback
            console.log('Trying syncSellers as fallback...');
            const syncSuccess = await syncService.syncSellers(user.id);

            if (!syncSuccess) {
              // If that fails, try forceSyncContacts as a last resort
              console.log('Trying forceSyncContacts as final fallback...');
              await syncService.forceSyncContacts(user.id);
            }
          }
        } catch (error) {
          console.error('Error syncing seller to Supabase:', error);
        }
      }
      await loadSellers();

      setIsAddDialogOpen(false);
      setNewSeller({
        user_id: user.id,
        name: '',
        email: '',
        phone: '',
      });

      toast({
        title: 'Success',
        description: 'Seller added successfully',
      });
    } catch (error) {
      console.error('Error adding seller:', error);
      toast({
        title: 'Error',
        description: 'Failed to add seller',
        variant: 'destructive',
      });
    }
  };

  const handleEditSeller = async () => {
    if (!selectedSeller) return;

    console.log('handleEditSeller called for seller:', selectedSeller);

    try {
      if (!selectedSeller.name) {
        toast({
          title: 'Validation Error',
          description: 'Seller name is required',
          variant: 'destructive',
        });
        return;
      }

      // Update seller in local database
      await dbService.updateSeller(selectedSeller);
      console.log('Updated seller in local database:', selectedSeller);

      // Automatically sync to Supabase if online
      if (navigator.onLine) {
        try {
          console.log('Automatically syncing updated seller to Supabase:', selectedSeller);

          // First try the direct service method
          const result = await supabaseService.updateSeller(selectedSeller);

          if (result) {
            console.log('Successfully updated seller in Supabase:', result);
          } else {
            console.error('Failed to update seller in Supabase, trying fallback methods');

            // Try using the syncSellers method as a fallback
            console.log('Trying syncSellers as fallback...');
            const syncSuccess = await syncService.syncSellers(user.id);

            if (!syncSuccess) {
              // If that fails, try forceSyncContacts as a last resort
              console.log('Trying forceSyncContacts as final fallback...');
              await syncService.forceSyncContacts(user.id);
            }
          }
        } catch (error) {
          console.error('Error syncing updated seller to Supabase:', error);
        }
      }
      await loadSellers();

      setIsEditDialogOpen(false);
      setSelectedSeller(null);

      toast({
        title: 'Success',
        description: 'Seller updated successfully',
      });
    } catch (error) {
      console.error('Error updating seller:', error);
      toast({
        title: 'Error',
        description: 'Failed to update seller',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSeller = async () => {
    if (!selectedSeller) return;

    console.log('handleDeleteSeller called for seller:', selectedSeller.id);

    try {
      // Delete seller from local database
      await dbService.deleteSeller(selectedSeller.id);
      console.log('Deleted seller from local database:', selectedSeller.id);

      // Automatically delete from Supabase if online
      if (navigator.onLine) {
        try {
          console.log('Automatically deleting seller from Supabase:', selectedSeller.id);

          // Use the service method to delete from Supabase
          const result = await supabaseService.deleteSeller(selectedSeller.id);

          if (result) {
            console.log('Successfully deleted seller from Supabase:', selectedSeller.id);
          } else {
            console.error('Failed to delete seller from Supabase');
          }
        } catch (error) {
          console.error('Error deleting seller from Supabase:', error);
        }
      }
      await loadSellers();

      setIsDeleteDialogOpen(false);
      setSelectedSeller(null);

      toast({
        title: 'Success',
        description: 'Seller deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting seller:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete seller',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Sellers</h1>
          <ForceBuyerSellerSync
            type="sellers"
            onSyncComplete={loadSellers}
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

                // Get all local sellers
                const localSellers = await dbService.getSellersByUser(user.id);
                alert(`Found ${localSellers.length} local sellers to sync`);

                // Import the Supabase client directly
                const { supabaseSimple } = await import('@/integrations/supabase/simple-client');

                // Try to sync each seller
                let successCount = 0;
                let errorCount = 0;

                for (const seller of localSellers) {
                  try {
                    // Prepare the seller data with created_at
                    const sellerData = {
                      ...seller,
                      created_at: seller.created_at || new Date().toISOString()
                    };

                    // Direct upsert to Supabase
                    const { error } = await supabaseSimple
                      .from('sellers')
                      .upsert(sellerData)
                      .select();

                    if (error) {
                      console.error(`Error syncing seller ${seller.id}:`, error);
                      errorCount++;
                    } else {
                      console.log(`Successfully synced seller ${seller.id}`);
                      successCount++;
                    }
                  } catch (sellerError) {
                    console.error(`Error processing seller ${seller.id}:`, sellerError);
                    errorCount++;
                  }
                }

                alert(`Sync complete: ${successCount} succeeded, ${errorCount} failed`);
                await loadSellers();
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
              placeholder="Search sellers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Search box only in the header, Add button moved to floating button */}
        </div>
      </div>

      <div className="mb-6">
        <CheckSupabaseConnection />
      </div>

      {filteredSellers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {sellers.length === 0
            ? "You haven't added any sellers yet. Click 'Add Seller' to get started."
            : "No sellers match your search criteria."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSellers.map((seller) => (
            <Card key={seller.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <CardTitle className="text-lg mb-2 sm:mb-0">{seller.name}</CardTitle>
                  <div className="flex space-x-2 w-full sm:w-auto justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-blue-600"
                      onClick={() => openEditDialog(seller)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-red-600"
                      onClick={() => openDeleteDialog(seller)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {seller.phone && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phone:</span>
                      <span className="text-sm font-medium">{seller.phone}</span>
                    </div>
                  )}
                  {seller.email && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="text-sm font-medium">{seller.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Add Button with animation */}
      <div
        className="floating-add-button"
        onClick={() => setIsAddDialogOpen(true)}
        title="Add New Seller"
      >
        <Plus size={32} />
      </div>

      {/* Add Seller Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Seller</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={newSeller.name}
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
                value={newSeller.phone || ''}
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
                value={newSeller.email || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSeller}>Add Seller</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Seller Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Seller</DialogTitle>
          </DialogHeader>
          {selectedSeller && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit_name"
                  name="name"
                  value={selectedSeller.name}
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
                  value={selectedSeller.phone || ''}
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
                  value={selectedSeller.email || ''}
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
            <Button onClick={handleEditSeller}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Seller Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Seller</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this seller? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSeller}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellersList;
