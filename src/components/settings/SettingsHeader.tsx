import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const SettingsHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center mb-6 border-b pb-4">
      <Button variant="ghost" size="icon" className="mr-4" onClick={() => navigate('/')}>
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only">Back</span>
      </Button>
      <h1 className="text-2xl font-bold tracking-tight">TransactLy Settings</h1>
    </div>
  );
};

export default SettingsHeader;
