import { ExportFormat } from '@/lib/exportUtils';

export interface AuthHeaderProps {
  businessName?: string;
  pageTitle?: string;
  onEditName?: () => void;
  onExport?: (format: ExportFormat) => void;
  children?: React.ReactNode;
}
