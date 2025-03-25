
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface TransactionGoodsFieldsProps {
  control: Control<any>;
}

export const TransactionGoodsFields = ({ control }: TransactionGoodsFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="goodsName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Goods Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter goods name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter quantity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="purchaseRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Rate</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter rate" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
