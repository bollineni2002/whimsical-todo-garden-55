
import { TabKey } from '@/lib/types';
import { Dispatch, SetStateAction } from 'react';
import { ExportFormat } from '@/lib/exportUtils';

export interface TabNavigationProps {
  activeTab: TabKey;
  onTabChange: Dispatch<SetStateAction<TabKey>>;
  disabledTabs?: TabKey[];
}

export interface AuthHeaderProps {
  children?: React.ReactNode;
  businessName: string;
  onEditName: () => void;
  onExport?: (format: ExportFormat) => Promise<void>;
}
