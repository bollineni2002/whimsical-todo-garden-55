
import { Transaction } from '@/lib/types';
import TransactionCard from '@/components/TransactionCard';
import { motion } from 'framer-motion';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList = ({ transactions }: TransactionListProps) => {
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
