
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
          {activeTab === TabKey.LOAD_BUY && (
            <LoadBuyContent 
              data={transaction.loadBuy} 
              transaction={transaction} 
              refreshTransaction={refreshTransaction} 
            />
          )}
          
          {activeTab === TabKey.TRANSPORTATION && (
            <TransportationContent 
              data={transaction.transportation} 
              transaction={transaction} 
              refreshTransaction={refreshTransaction} 
            />
          )}
          
          {activeTab === TabKey.LOAD_SOLD && (
            <LoadSoldContent 
              data={transaction.loadSold} 
              transaction={transaction} 
              refreshTransaction={refreshTransaction} 
            />
          )}
          
          {activeTab === TabKey.PAYMENTS && (
            <PaymentsContent 
              payments={transaction.payments} 
              transaction={transaction} 
              refreshTransaction={refreshTransaction} 
            />
          )}
          
          {activeTab === TabKey.NOTES && (
            <NotesContent 
              notes={transaction.notes} 
              transaction={transaction} 
              refreshTransaction={refreshTransaction} 
            />
          )}
          
          {activeTab === TabKey.ATTACHMENTS && (
            <AttachmentsContent 
              attachments={transaction.attachments} 
              transaction={transaction} 
              refreshTransaction={refreshTransaction} 
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TabContent;
