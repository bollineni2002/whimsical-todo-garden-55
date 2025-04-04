import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PreferencesSettingsProps {
  businessName?: string;
  onBusinessNameChange?: (newName: string) => Promise<void>;
}

const PreferencesSettings = ({ 
  businessName = 'TransactLy', 
  onBusinessNameChange 
}: PreferencesSettingsProps) => {
  const [name, setName] = useState(businessName);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (onBusinessNameChange && name !== businessName) {
      setIsSaving(true);
      try {
        await onBusinessNameChange(name);
      } catch (error) {
        console.error('Error saving business name:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize how the application appears and functions for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="business-name">Business Name</Label>
          <div className="flex gap-2">
            <Input
              id="business-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your business name"
              className="flex-1"
            />
            <Button 
              onClick={handleSave} 
              disabled={isSaving || name === businessName}
              size="sm"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This name will be displayed throughout the application.
          </p>
        </div>
        
        {/* Additional preferences can be added here */}
      </CardContent>
    </Card>
  );
};

export default PreferencesSettings;
