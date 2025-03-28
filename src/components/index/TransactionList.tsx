
import { Transaction } from '@/lib/types';
import TransactionCard from '@/components/TransactionCard';
import { motion } from 'framer-motion';
import EmptyTransactionsState from './EmptyTransactionsState';

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onRefresh: () => void;
  onCreateTransaction: () => void;
}

const TransactionList = ({ 
  transactions, 
  loading, 
  onRefresh,
  onCreateTransaction
}: TransactionListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (transactions.length === 0) {
    return <EmptyTransactionsState onTransactionCreated={onRefresh} />;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {transactions.map((transaction, index) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          index={index}
        />
      ))}
    </div>
  );
};

export default TransactionList;
