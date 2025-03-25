import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/lib/types';
import { motion } from 'framer-motion';

interface TransactionCardProps {
  transaction: Transaction;
  index: number;
}

const StatusBadge = ({ status }: { status: Transaction['status'] }) => {
  const statusConfig = {
    completed: {
      bg: 'bg-success/10',
      text: 'text-success',
      label: 'Completed'
    },
    pending: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-500',
      label: 'Pending'
    },
    cancelled: {
      bg: 'bg-destructive/10',
      text: 'text-destructive',
      label: 'Cancelled'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

const TransactionCard = ({ transaction, index }: TransactionCardProps) => {
  const navigate = useNavigate();
  const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleCardClick = () => {
    navigate(`/transaction/${transaction.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card rounded-xl p-4 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {formattedDate}
        </span>
        <StatusBadge status={transaction.status} />
      </div>
      
      <h3 className="text-lg font-medium mb-1">
        {transaction.name || `Transaction ${transaction.id.slice(0, 5)}`}
      </h3>
      
      <div className="grid grid-cols-1 gap-2 mt-3 mb-2">
        {transaction.loadBuy && (
          <div className="text-sm">
            <span className="text-muted-foreground">From: </span>
            <span className="font-medium">{transaction.loadBuy.supplierName || "N/A"}</span>
          </div>
        )}
        
        {transaction.loadSold && (
          <div className="text-sm">
            <span className="text-muted-foreground">To: </span>
            <span className="font-medium">{transaction.loadSold.buyerName || "N/A"}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/30">
        <div className="text-sm text-muted-foreground">
          {transaction.loadBuy?.goodsName || ""}
        </div>
        
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">{formatCurrency(transaction.totalAmount)}</span>
          <svg 
            className="w-4 h-4 text-muted-foreground" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionCard;
