
import { TabKey } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TabNavigationProps } from '@/types/component-types';
import { useIsMobile } from '@/hooks/use-mobile';

const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
  {
    key: TabKey.LOAD_BUY,
    label: 'Load Buy',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
        <path d="M18 12v4"></path>
      </svg>
    )
  },
  {
    key: TabKey.TRANSPORTATION,
    label: 'Transportation',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    )
  },
  {
    key: TabKey.LOAD_SOLD,
    label: 'Load Sold',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"></path>
        <path d="m19 9-5 5-4-4-3 3"></path>
      </svg>
    )
  },
  {
    key: TabKey.PAYMENTS,
    label: 'Payments',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
        <line x1="2" y1="10" x2="22" y2="10"></line>
      </svg>
    )
  },
  {
    key: TabKey.NOTES,
    label: 'Notes',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
    )
  },
  {
    key: TabKey.ATTACHMENTS,
    label: 'Attachments',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
      </svg>
    )
  }
];

const TabNavigation = ({ activeTab, onTabChange, disabledTabs = [] }: TabNavigationProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "w-full bg-background",
      isMobile ? "overflow-x-auto scrollbar-hide" : ""
    )}>
      <div className={cn(
        "px-4", 
        isMobile ? "py-3" : "py-6"
      )}>
        <h2 className={cn(
          "font-medium", 
          isMobile ? "text-lg" : "text-xl"
        )}>Transaction Details</h2>
      </div>
      
      <nav className={cn(
        "flex px-2 pb-0 mb-4 overflow-x-auto scrollbar-hide transaction-tabs",
        isMobile ? "gap-0.5" : "gap-1"
      )}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isDisabled = disabledTabs.includes(tab.key);
          
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-all flex-shrink-0 transaction-tab",
                "relative overflow-hidden",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                isMobile
                  ? isActive
                    ? "px-3 py-2"
                    : "px-2 py-2"
                  : "px-3 py-3 gap-3",
                isDisabled && "opacity-50 pointer-events-none"
              )}
              disabled={isDisabled}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={cn(
                    "absolute bg-primary",
                    "left-0 right-0 bottom-0 h-0.5" // Horizontal indicator for tabs
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <span className="flex items-center gap-2">
                {tab.icon}
                <span className={cn(
                  "whitespace-nowrap",
                  isMobile && !isActive ? "sr-only" : "inline-block",
                  isMobile && "text-sm"
                )}>
                  {tab.label}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;
