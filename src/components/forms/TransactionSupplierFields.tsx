
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface TransactionSupplierFieldsProps {
  control: Control<any>;
}

export const TransactionSupplierFields = ({ control }: TransactionSupplierFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="supplierName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Supplier Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter supplier name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="supplierContact"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Supplier Contact</FormLabel>
            <FormControl>
              <Input placeholder="Enter supplier contact" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
