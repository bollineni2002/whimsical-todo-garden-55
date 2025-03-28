
import { TabKey, Transaction } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import TransportationContent from './TransportationComponent';
import LoadBuyContent from './tab-contents/LoadBuyContent';
import LoadSoldContent from './tab-contents/LoadSoldContent';
import PaymentsContent from './tab-contents/PaymentsContent';
import NotesContent from './tab-contents/NotesContent';
import AttachmentsContent from './tab-contents/AttachmentsContent';

interface TabContentProps {
  activeTab: TabKey;
  transaction: Transaction;
  refreshTransaction: () => Promise<void>;
}

const TabContent: React.FC<TabContentProps> = ({ activeTab, transaction, refreshTransaction }) => {
  const renderTabContent = () => {
    switch(activeTab) {
      case TabKey.LOAD_BUY:
        return (
          <LoadBuyContent 
            data={transaction.loadBuy} 
            transaction={transaction} 
            refreshTransaction={refreshTransaction} 
          />
        );
        
      case TabKey.TRANSPORTATION:
        return (
          <TransportationContent 
            data={transaction.transportation} 
            transaction={transaction} 
            refreshTransaction={refreshTransaction} 
          />
        );
        
      case TabKey.LOAD_SOLD:
        return (
          <LoadSoldContent 
            data={transaction.loadSold} 
            transaction={transaction} 
            refreshTransaction={refreshTransaction} 
          />
        );
        
      case TabKey.PAYMENTS:
        return (
          <PaymentsContent 
            payments={transaction.payments || []} 
            transaction={transaction} 
            refreshTransaction={refreshTransaction} 
          />
        );
        
      case TabKey.NOTES:
        return (
          <NotesContent 
            notes={transaction.notes || []} 
            transaction={transaction} 
            refreshTransaction={refreshTransaction} 
          />
        );
        
      case TabKey.ATTACHMENTS:
        return (
          <AttachmentsContent 
            attachments={transaction.attachments || []} 
            transaction={transaction} 
            refreshTransaction={refreshTransaction} 
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="mt-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-card rounded-lg p-6 shadow-sm border"
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TabContent;
