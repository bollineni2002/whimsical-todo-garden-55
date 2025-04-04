
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/context/CurrencyContext';
import { Transaction } from '@/lib/types';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

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
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

const TransactionCard = ({ transaction, index }: TransactionCardProps) => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleCardClick = () => {
    navigate(`/transaction/${transaction.id}`);
  };

  const isOutgoing = transaction.loadBuy && !transaction.loadSold;
  const isIncoming = !transaction.loadBuy && transaction.loadSold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="bg-card/50 border border-border/30 shadow-sm rounded-lg p-2 cursor-pointer hover:bg-muted/10 transition-colors"
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {formattedDate}
        </span>
        <StatusBadge status={transaction.status} />
      </div>
      
      <h3 className="text-xs font-medium truncate mb-0.5">
        {transaction.name || `Transaction ${transaction.id.slice(0, 5)}`}
      </h3>
      
      <div className="flex items-center gap-1 mt-1 mb-0.5 text-[10px] text-muted-foreground">
        {isOutgoing && (
          <ArrowUpRight className="h-3 w-3 flex-shrink-0 text-red-500" />
        )}
        {isIncoming && (
          <ArrowDownLeft className="h-3 w-3 flex-shrink-0 text-green-500" />
        )}
        <span className="truncate">
          {transaction.loadBuy ? 
            `From: ${transaction.loadBuy.supplierName || "N/A"}` :
            transaction.loadSold ? 
              `To: ${transaction.loadSold.buyerName || "N/A"}` : 
              "No supplier/buyer info"}
        </span>
      </div>
      
      <div className="flex justify-between items-center mt-1 pt-0.5 border-t border-border/20">
        <div className="text-[10px] text-muted-foreground truncate max-w-[60%]">
          {transaction.loadBuy?.goodsName || transaction.loadSold?.buyerName || ""}
        </div>
        
        <div className="flex items-center">
          <span className="text-xs font-medium">{formatCurrency(transaction.totalAmount)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionCard;
