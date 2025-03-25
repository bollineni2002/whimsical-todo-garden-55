
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface TransactionBasicFieldsProps {
  control: Control<any>;
}

export const TransactionBasicFields = ({ control }: TransactionBasicFieldsProps) => {
  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Transaction Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter transaction name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
