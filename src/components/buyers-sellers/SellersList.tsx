import React, { useState, useEffect } from 'react';
import { Seller } from '@/lib/types';
import { dbService } from '@/lib/db-service';
import { supabaseService } from '@/lib/supabase-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
import ForceBuyerSellerSync from './ForceBuyerSellerSync';

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

    try {
      setLoading(true);
      const data = await dbService.getSellersByUser(user.id);
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

      // Add seller to local database
      const createdSeller = await dbService.addSeller(sellerToAdd);

      // If online, also add to Supabase
      if (navigator.onLine) {
        try {
          await supabaseService.createSeller(createdSeller);
        } catch (error) {
          console.error('Error syncing seller to Supabase:', error);
          // Continue even if Supabase sync fails
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

      // If online, also update in Supabase
      if (navigator.onLine) {
        try {
          await supabaseService.updateSeller(selectedSeller);
        } catch (error) {
          console.error('Error syncing updated seller to Supabase:', error);
          // Continue even if Supabase sync fails
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

    try {
      // Delete seller from local database
      await dbService.deleteSeller(selectedSeller.id);

      // If online, also delete from Supabase
      if (navigator.onLine) {
        try {
          await supabaseService.deleteSeller(selectedSeller.id);
        } catch (error) {
          console.error('Error syncing deleted seller to Supabase:', error);
          // Continue even if Supabase sync fails
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Sellers</h1>
          <ForceBuyerSellerSync
            type="sellers"
            onSyncComplete={loadSellers}
            className="ml-2"
          />
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
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Seller
          </Button>
        </div>
      </div>

      {filteredSellers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {sellers.length === 0
            ? "You haven't added any sellers yet. Click 'Add Seller' to get started."
            : "No sellers match your search criteria."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSellers.map((seller) => (
            <Card key={seller.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{seller.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(seller)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(seller)}>
                      <Trash2 className="h-4 w-4" />
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
