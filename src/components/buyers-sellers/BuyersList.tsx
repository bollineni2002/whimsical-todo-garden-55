import React, { useState, useEffect } from 'react';
import { Buyer } from '@/lib/types';
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

    try {
      setLoading(true);
      const data = await dbService.getBuyersByUser(user.id);
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
    if (!user?.id) return;

    try {
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

      // If online, also add to Supabase
      if (navigator.onLine) {
        try {
          await supabaseService.createBuyer(createdBuyer);
        } catch (error) {
          console.error('Error syncing buyer to Supabase:', error);
          // Continue even if Supabase sync fails
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

      // If online, also update in Supabase
      if (navigator.onLine) {
        try {
          await supabaseService.updateBuyer(selectedBuyer);
        } catch (error) {
          console.error('Error syncing updated buyer to Supabase:', error);
          // Continue even if Supabase sync fails
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

    try {
      // Delete buyer from local database
      await dbService.deleteBuyer(selectedBuyer.id);

      // If online, also delete from Supabase
      if (navigator.onLine) {
        try {
          await supabaseService.deleteBuyer(selectedBuyer.id);
        } catch (error) {
          console.error('Error syncing deleted buyer to Supabase:', error);
          // Continue even if Supabase sync fails
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

      {filteredBuyers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {buyers.length === 0
            ? "You haven't added any buyers yet. Click 'Add Buyer' to get started."
            : "No buyers match your search criteria."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBuyers.map((buyer) => (
            <Card key={buyer.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{buyer.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(buyer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(buyer)}>
                      <Trash2 className="h-4 w-4" />
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
