
import { TabKey } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Truck, 
  ShoppingCart, 
  CreditCard, 
  FileText, 
  Paperclip
} from 'lucide-react';
import { ExtendedTabKey } from './TabContent';

interface TabNavigationProps {
  activeTab: TabKey | ExtendedTabKey;
  onTabChange: (tab: TabKey | ExtendedTabKey) => void;
  disabledTabs?: (TabKey | ExtendedTabKey)[];
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  disabledTabs = [] 
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange as (value: string) => void} className="w-full">
      <TabsList className="transaction-tabs w-full justify-start mb-0 overflow-x-auto">
        <TabsTrigger 
          value={TabKey.LOAD_BUY} 
          disabled={disabledTabs.includes(TabKey.LOAD_BUY)}
          icon={<Package className="h-4 w-4" />}
          className="transaction-tab"
        >
          Purchase
        </TabsTrigger>
        
        <TabsTrigger 
          value={TabKey.TRANSPORTATION} 
          disabled={disabledTabs.includes(TabKey.TRANSPORTATION)}
          icon={<Truck className="h-4 w-4" />}
          className="transaction-tab"
        >
          Transportation
        </TabsTrigger>
        
        <TabsTrigger 
          value={TabKey.LOAD_SOLD} 
          disabled={disabledTabs.includes(TabKey.LOAD_SOLD)}
          icon={<ShoppingCart className="h-4 w-4" />}
          className="transaction-tab"
        >
          Sale
        </TabsTrigger>
        
        <TabsTrigger 
          value={TabKey.PAYMENTS} 
          disabled={disabledTabs.includes(TabKey.PAYMENTS)}
          icon={<CreditCard className="h-4 w-4" />}
          className="transaction-tab"
        >
          Payments
        </TabsTrigger>
        
        <TabsTrigger 
          value={TabKey.NOTES} 
          disabled={disabledTabs.includes(TabKey.NOTES)}
          icon={<FileText className="h-4 w-4" />}
          className="transaction-tab"
        >
          Notes
        </TabsTrigger>
        
        <TabsTrigger 
          value={TabKey.ATTACHMENTS} 
          disabled={disabledTabs.includes(TabKey.ATTACHMENTS)}
          icon={<Paperclip className="h-4 w-4" />}
          className="transaction-tab"
        >
          Attachments
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default TabNavigation;
