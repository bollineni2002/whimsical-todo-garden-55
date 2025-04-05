
import { useState } from 'react';
import AuthHeader from '@/components/AuthHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FloatingActionButton from '@/components/FloatingActionButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserPlus, Users } from 'lucide-react';
import BuyerForm from '@/components/forms/BuyerForm';
import SupplierForm from '@/components/forms/SupplierForm';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const Clients = () => {
  const [activeTab, setActiveTab] = useState('buyers');
  const [showBuyerForm, setShowBuyerForm] = useState(false);
  const [showSellerForm, setShowSellerForm] = useState(false);
  const isMobile = useIsMobile();

  const actionOptions = [
    {
      label: "Add New Buyer",
      onClick: () => setShowBuyerForm(true),
      icon: <UserPlus className="h-4 w-4" />
    },
    {
      label: "Add New Seller",
      onClick: () => setShowSellerForm(true),
      icon: <Users className="h-4 w-4" />
    }
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <AuthHeader pageTitle="Clients" />
      
      <div className="p-2 sm:p-4 flex-1 overflow-auto">
        <Tabs defaultValue="buyers" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="buyers" className="flex-1">
              <UserPlus className="mr-2 h-4 w-4" />
              Buyers
            </TabsTrigger>
            <TabsTrigger value="sellers" className="flex-1">
              <Users className="mr-2 h-4 w-4" />
              Sellers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="buyers" className="mt-0">
            <div className="border rounded-md p-6 min-h-[200px]">
              <h2 className="text-2xl font-bold mb-2">Buyers Management</h2>
              <p className="text-muted-foreground mb-8">Add and manage your buyers in one place</p>
              <div className="flex justify-center items-center h-32">
                <p className="text-center text-muted-foreground">
                  No buyers added yet. Add your first buyer.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sellers" className="mt-0">
            <div className="border rounded-md p-6 min-h-[200px]">
              <h2 className="text-2xl font-bold mb-2">Sellers Management</h2>
              <p className="text-muted-foreground mb-8">Add and manage your sellers in one place</p>
              <div className="flex justify-center items-center h-32">
                <p className="text-center text-muted-foreground">
                  No sellers added yet. Add your first seller.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating Action Button */}
      <FloatingActionButton options={actionOptions} />

      {/* Buyer Form Dialog */}
      <Dialog open={showBuyerForm} onOpenChange={setShowBuyerForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogTitle>Add New Buyer</DialogTitle>
          <BuyerForm onSuccess={() => setShowBuyerForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Seller Form Dialog */}
      <Dialog open={showSellerForm} onOpenChange={setShowSellerForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogTitle>Add New Seller</DialogTitle>
          <SupplierForm onSuccess={() => setShowSellerForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
