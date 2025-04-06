import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BuyersList from '@/components/buyers-sellers/BuyersList';
import SellersList from '@/components/buyers-sellers/SellersList';
import ForceSyncButton from '@/components/common/ForceSyncButton';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const BuyersSellersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('buyers');
  const [key, setKey] = useState(0); // Used to force re-render of components
  const { user } = useAuth();

  const handleSyncComplete = useCallback(async () => {
    // Force re-render of components by changing the key
    setKey(prevKey => prevKey + 1);
  }, []);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contacts Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your buyers and sellers in one place
          </p>
        </div>
        <ForceSyncButton onSyncComplete={handleSyncComplete} className="self-end" />
      </div>

      <Tabs defaultValue="buyers" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="buyers">Buyers</TabsTrigger>
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
        </TabsList>
        <TabsContent value="buyers">
          <BuyersList key={`buyers-${key}`} />
        </TabsContent>
        <TabsContent value="sellers">
          <SellersList key={`sellers-${key}`} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuyersSellersPage;
