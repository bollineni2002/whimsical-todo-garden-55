
import { TabKey } from '@/lib/types';
import { Dispatch, SetStateAction } from 'react';

export interface TabNavigationProps {
  activeTab: TabKey;
  onTabChange: Dispatch<SetStateAction<TabKey>>;
  disabledTabs?: TabKey[];
}

export interface AuthHeaderProps {
  children?: React.ReactNode;
  businessName: string;
  onEditName: () => void;
  onExport?: (format: 'pdf' | 'csv' | 'excel') => void;
}
