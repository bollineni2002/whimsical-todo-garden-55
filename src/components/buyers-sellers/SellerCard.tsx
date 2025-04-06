import React from 'react';
import { Seller } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface SellerCardProps {
  seller: Seller;
  onEdit: (seller: Seller) => void;
  onDelete: (seller: Seller) => void;
}

const SellerCard: React.FC<SellerCardProps> = ({ seller, onEdit, onDelete }) => {
  return (
    <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Add edit/delete buttons that are always visible in the top right */}
      <div className="absolute top-2 right-2 flex space-x-2 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 bg-white dark:bg-gray-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700"
          onClick={() => onEdit(seller)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 bg-white dark:bg-gray-800 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
          onClick={() => onDelete(seller)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
      
      <CardHeader className="pb-2 pt-8">
        <CardTitle className="text-lg">{seller.name}</CardTitle>
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
  );
};

export default SellerCard;
