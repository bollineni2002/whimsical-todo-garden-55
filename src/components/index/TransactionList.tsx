
import { Transaction } from '@/lib/types';
import TransactionCard from '@/components/TransactionCard';
import { motion } from 'framer-motion';
import EmptyTransactionsState from './EmptyTransactionsState';
import { Loader2 } from 'lucide-react';

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
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (transactions.length === 0) {
    return <EmptyTransactionsState onTransactionCreated={onRefresh} />;
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
    >
      {transactions.map((transaction, index) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          index={index}
        />
      ))}
    </motion.div>
  );
};

export default TransactionList;
