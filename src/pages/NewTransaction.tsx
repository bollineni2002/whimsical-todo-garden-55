
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import TransactionForm from '@/components/forms/TransactionForm';

const NewTransaction = () => {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTransaction;
