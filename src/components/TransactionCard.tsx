
import { useNavigate } from 'react-router-dom';
// import { formatCurrency } from '@/lib/utils'; // Remove old import
import { useCurrency } from '@/context/CurrencyContext'; // Import useCurrency hook
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
  const { formatCurrency } = useCurrency(); // Get formatCurrency from context
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
      className="glass-card rounded-xl p-3 cursor-pointer" // Reduced padding from p-4 to p-3
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between mb-1"> {/* Reduced margin from mb-2 to mb-1 */}
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {formattedDate}
        </span>
        <StatusBadge status={transaction.status} />
      </div>
      
      <h3 className="text-base font-medium mb-1"> {/* Reduced text size from text-lg to text-base */}
        {transaction.name || `Transaction ${transaction.id.slice(0, 5)}`}
      </h3>
      
      <div className="grid grid-cols-1 gap-1 mt-2 mb-1"> {/* Reduced gap and margins */}
        {transaction.loadBuy && (
          <div className="text-xs"> {/* Reduced text size from text-sm to text-xs */}
            <span className="text-muted-foreground">From: </span>
            <span className="font-medium">{transaction.loadBuy.supplierName || "N/A"}</span>
          </div>
        )}
        
        {transaction.loadSold && (
          <div className="text-xs"> {/* Reduced text size from text-sm to text-xs */}
            <span className="text-muted-foreground">To: </span>
            <span className="font-medium">{transaction.loadSold.buyerName || "N/A"}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-1 pt-1 border-t border-border/30"> {/* Reduced margin and padding */}
        <div className="text-xs text-muted-foreground"> {/* Reduced text size from text-sm to text-xs */}
          {transaction.loadBuy?.goodsName || ""}
        </div>
        
        <div className="flex items-center">
          <span className="text-xs font-medium mr-1">{formatCurrency(transaction.totalAmount)}</span> {/* Reduced text and margin */}
          <svg 
            className="w-3 h-3 text-muted-foreground" /* Reduced icon size from w-4 h-4 to w-3 h-3 */
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
