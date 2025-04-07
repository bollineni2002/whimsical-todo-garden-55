
import {
  Percent,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CalculationsNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isMobile?: boolean;
}

const CalculationsNavigation: React.FC<CalculationsNavigationProps> = ({
  activeSection,
  onSectionChange,
  isMobile
}) => {
  return (
    <Tabs value={activeSection} onValueChange={onSectionChange} className="w-full">
      <TabsList className="w-full">
        <TabsTrigger
          value="tax"
          className="flex-1"
          icon={<Percent className="h-4 w-4" />}
        >
          Tax
        </TabsTrigger>
        <TabsTrigger
          value="interest"
          className="flex-1"
          icon={<TrendingUp className="h-4 w-4" />}
        >
          Interest
        </TabsTrigger>
        <TabsTrigger
          value="currency"
          className="flex-1"
          icon={<DollarSign className="h-4 w-4" />}
        >
          Currency
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default CalculationsNavigation;
