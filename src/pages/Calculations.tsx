
import { useState } from 'react';
import CalculationsNavigation from '@/components/CalculationsNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import AuthHeader from '@/components/AuthHeader';

const Calculations = () => {
  const [activeSection, setActiveSection] = useState('tax');
  const isMobile = useIsMobile(); // Ensure this hook is working correctly
  console.log('isMobile:', isMobile); // Debugging line

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header with page-specific title */}
      <AuthHeader pageTitle="Calculations" />
      
      {/* Navigation */}
      <div className={`w-full border-b border-border ${isMobile ? 'px-2 py-1' : ''}`}>
        <CalculationsNavigation 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
          isMobile={isMobile} // Pass isMobile prop
        />
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-auto ${isMobile ? 'p-2' : 'px-4'}`}>
        {activeSection === 'tax' && <div>Tax Content</div>}
        {activeSection === 'interest' && <div>Interest Content</div>}
        {activeSection === 'currency' && <div>Currency Content</div>}
      </div>
    </div>
  );
};

export default Calculations;
