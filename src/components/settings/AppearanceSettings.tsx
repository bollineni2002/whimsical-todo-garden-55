import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage, languages } from '@/lib/languages';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';

// Define currency options
const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

// Define date format options
const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g., 12/31/2023)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g., 31/12/2023)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g., 2023-12-31)' },
  { value: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY (e.g., 31-Dec-2023)' },
];

// Define view options
const viewOptions = [
  { value: 'dashboard', label: 'Dashboard View' },
  { value: 'list', label: 'List View' },
];

interface AppearanceSettingsProps {
  businessName?: string;
  onBusinessNameChange?: (newName: string) => Promise<void>;
}

const AppearanceSettings = ({ 
  businessName = 'TransactLy', 
  onBusinessNameChange 
}: AppearanceSettingsProps) => {
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  
  const [name, setName] = useState(businessName);
  const [isSaving, setIsSaving] = useState(false);
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'USD';
  });
  const [dateFormat, setDateFormat] = useState(() => {
    return localStorage.getItem('dateFormat') || 'MM/DD/YYYY';
  });
  const [defaultView, setDefaultView] = useState(() => {
    return localStorage.getItem('defaultView') || 'dashboard';
  });

  const handleSaveBusinessName = async () => {
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

  const handleCurrencyChange = async (value: string) => {
    setCurrency(value);
    localStorage.setItem('currency', value);
    toast({
      title: 'Currency Updated',
      description: 'Your currency preference has been updated.',
    });
  };

  const handleDateFormatChange = async (value: string) => {
    setDateFormat(value);
    localStorage.setItem('dateFormat', value);
    toast({
      title: 'Date Format Updated',
      description: 'Your date format preference has been updated.',
    });
  };

  const handleDefaultViewChange = async (value: string) => {
    setDefaultView(value);
    localStorage.setItem('defaultView', value);
    toast({
      title: 'Default View Updated',
      description: 'Your default view preference has been updated.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Customize how the application appears and functions for you.
        </p>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Theme</CardTitle>
          <CardDescription>Choose your preferred theme.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={theme} 
            onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark">Dark</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system">System</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Font Size Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Font Size</CardTitle>
          <CardDescription>Adjust the text size throughout the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={fontSize} 
            onValueChange={(value) => setFontSize(value as 'small' | 'medium' | 'large')}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="small" id="font-small" />
              <Label htmlFor="font-small" className="text-sm">Small</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="font-medium" />
              <Label htmlFor="font-medium" className="text-base">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="font-large" />
              <Label htmlFor="font-large" className="text-lg">Large</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Business Name Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Business Name</CardTitle>
          <CardDescription>Set your business name to be displayed throughout the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              id="business-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your business name"
              className="flex-1"
            />
            <Button 
              onClick={handleSaveBusinessName} 
              disabled={isSaving || name === businessName}
              size="sm"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Language</CardTitle>
          <CardDescription>Choose your preferred language for the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={language}
            onValueChange={(value) => setLanguage(value as any)}
          >
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Currency</CardTitle>
          <CardDescription>Choose your preferred currency for transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={currency}
            onValueChange={handleCurrencyChange}
          >
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} - {curr.name} ({curr.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Date Format Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Date Format</CardTitle>
          <CardDescription>Choose how dates are displayed throughout the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={dateFormat}
            onValueChange={handleDateFormatChange}
          >
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Select Date Format" />
            </SelectTrigger>
            <SelectContent>
              {dateFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Default View Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Default View</CardTitle>
          <CardDescription>Choose your preferred default view for the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={defaultView} 
            onValueChange={handleDefaultViewChange}
            className="flex flex-col space-y-1"
          >
            {viewOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`view-${option.value}`} />
                <Label htmlFor={`view-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
