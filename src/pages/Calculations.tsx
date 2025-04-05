
import { useState } from 'react';
import CalculationsNavigation from '@/components/CalculationsNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import AuthHeader from '@/components/AuthHeader';
import TaxCalculator from '@/components/calculations/TaxCalculator';
import InterestCalculator from '@/components/calculations/InterestCalculator';
import CurrencyConverter from '@/components/calculations/CurrencyConverter';

const Calculations = () => {
  const [activeSection, setActiveSection] = useState('tax');
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header with page-specific title */}
      <AuthHeader pageTitle="Calculations" />
      
      {/* Navigation */}
      <div className={`w-full border-b border-border ${isMobile ? 'px-2 py-1' : ''}`}>
        <CalculationsNavigation 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
          isMobile={isMobile}
        />
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-auto ${isMobile ? 'p-2' : 'px-4 py-4'}`}>
        {activeSection === 'tax' && <TaxCalculator />}
        {activeSection === 'interest' && <InterestCalculator />}
        {activeSection === 'currency' && <CurrencyConverter />}
      </div>
    </div>
  );
};

export default Calculations;
