
import { TabKey, CompleteTransaction } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import TransportationContent from './tab-contents/TransportationContent';
import PurchasesContent from './tab-contents/PurchasesContent';
import SalesContent from './tab-contents/SalesContent';
import PaymentsContent from './tab-contents/PaymentsContent';
import NotesContent from './tab-contents/NotesContent';
import AttachmentsContent from './tab-contents/AttachmentsContent';

// Extended TabKey enum to include any additional tabs
export enum ExtendedTabKey {
  PURCHASES = 'purchases',
  TRANSPORTATION = 'transportation',
  SALES = 'sales',
  PAYMENTS = 'payments',
  NOTES = 'notes',
  ATTACHMENTS = 'attachments'
}

interface TabContentProps {
  activeTab: TabKey | ExtendedTabKey;
  transaction: CompleteTransaction;
  refreshTransaction: () => Promise<void>;
}

const TabContent: React.FC<TabContentProps> = ({ activeTab, transaction, refreshTransaction }) => {
  const renderTabContent = () => {
    switch(activeTab) {
      case TabKey.PURCHASES:
      case ExtendedTabKey.PURCHASES:
        return (
          <PurchasesContent
            transaction={transaction}
            refreshTransaction={refreshTransaction}
          />
        );

      case TabKey.TRANSPORTATION:
      case ExtendedTabKey.TRANSPORTATION:
        return (
          <TransportationContent
            transaction={transaction}
            refreshTransaction={refreshTransaction}
          />
        );

      case TabKey.SALES:
      case ExtendedTabKey.SALES:
        return (
          <SalesContent
            transaction={transaction}
            refreshTransaction={refreshTransaction}
          />
        );

      case TabKey.PAYMENTS:
      case ExtendedTabKey.PAYMENTS:
        return (
          <PaymentsContent
            transaction={transaction}
            refreshTransaction={refreshTransaction}
          />
        );

      case TabKey.NOTES:
      case ExtendedTabKey.NOTES:
        return (
          <NotesContent
            transaction={transaction}
            refreshTransaction={refreshTransaction}
          />
        );

      case TabKey.ATTACHMENTS:
      case ExtendedTabKey.ATTACHMENTS:
        return (
          <AttachmentsContent
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
          className="bg-card text-card-foreground rounded-lg p-6 shadow-sm border border-border"
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TabContent;
