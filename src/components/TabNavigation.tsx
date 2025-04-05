import { TabKey } from '@/lib/types';
import { ExtendedTabKey } from './TabContent';
import { 
  Package, 
  Truck, 
  ShoppingCart, 
  CreditCard, 
  FileText, 
  Paperclip
} from 'lucide-react';

interface TabNavigationProps {
  activeTab: TabKey | ExtendedTabKey;
  onTabChange: (tab: TabKey | ExtendedTabKey) => void;
  disabledTabs: TabKey[];
  isMobile?: boolean; // Add isMobile prop
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  disabledTabs, 
  isMobile 
}) => {
  const tabs = [
    { key: TabKey.LOAD_BUY, label: 'Purchase', icon: <Package className="h-4 w-4" /> },
    { key: TabKey.TRANSPORTATION, label: 'Transportation', icon: <Truck className="h-4 w-4" /> },
    { key: TabKey.LOAD_SOLD, label: 'Sale', icon: <ShoppingCart className="h-4 w-4" /> },
    { key: TabKey.PAYMENTS, label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
    { key: TabKey.NOTES, label: 'Notes', icon: <FileText className="h-4 w-4" /> },
    { key: TabKey.ATTACHMENTS, label: 'Attachments', icon: <Paperclip className="h-4 w-4" /> },
  ];

  return (
    <div className={`flex ${isMobile ? 'justify-around' : 'justify-start'} items-center`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          disabled={disabledTabs.includes(tab.key)}
          className={`flex items-center px-3 py-2 text-sm font-medium ${
            activeTab === tab.key
              ? 'text-primary border-b-2 border-primary'
              : 'text-foreground/80' // Increased contrast for inactive tabs
          } ${isMobile ? 'flex-col' : ''}`}
        >
          {tab.icon}
          <span className={`${isMobile ? 'mt-1 text-xs' : 'ml-2'} ${activeTab === tab.key ? '' : 'hidden md:inline'}`}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
