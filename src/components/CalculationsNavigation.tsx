import { 
  Percent, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';

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
  const sections = [
    { key: 'tax', label: 'Tax', icon: <Percent className="h-4 w-4" /> },
    { key: 'interest', label: 'Interest', icon: <TrendingUp className="h-4 w-4" /> },
    { key: 'currency', label: 'Currency', icon: <DollarSign className="h-4 w-4" /> },
  ];

  return (
    <div className={`flex ${isMobile ? 'justify-around' : 'justify-start'} items-center`}>
      {sections.map((section) => (
        <button
          key={section.key}
          onClick={() => onSectionChange(section.key)}
          className={`flex items-center px-3 py-2 text-sm font-medium ${
            activeSection === section.key
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted'
          } ${isMobile ? 'flex-col' : ''}`}
        >
          {section.icon}
          {isMobile && activeSection === section.key && (
            <span className="mt-1 text-xs">{section.label}</span>
          )}
          {!isMobile && (
            <span className="ml-2">{section.label}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default CalculationsNavigation;
