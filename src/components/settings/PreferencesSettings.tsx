import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext'; // Added
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Added
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns'; // For date format preview
import { Loader2, Edit2, Sun, Moon, Laptop } from 'lucide-react'; // Added Icons

// Define types for preferences
type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR';
type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD-MMM-YYYY';
type DefaultView = 'Dashboard' | 'List';

interface AppPreferences {
  currency: Currency;
  dateFormat: DateFormat;
  defaultView: DefaultView;
}

// Constants for options
const currencyOptions: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
];

const dateFormatOptions: { value: DateFormat; label: string }[] = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (American)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (European)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
  { value: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY (Long)' },
];

const defaultViewOptions: { value: DefaultView; label: string }[] = [
  { value: 'Dashboard', label: 'Dashboard (Grid View)' },
  { value: 'List', label: 'List View (Traditional)' },
];

const PREFERENCES_STORAGE_KEY = 'appPreferences';

const PreferencesSettings = () => {
  const { user, updateProfile, isLoading: isAuthLoading } = useAuth();
  const { theme, setTheme, fontSize, setFontSize } = useTheme(); // Added Theme hook
  const { toast } = useToast();
  const [isSavingPrefs, setIsSavingPrefs] = useState(false); // Separate loading for local storage save
  const [isEditingBusinessName, setIsEditingBusinessName] = useState(false);
  const [businessNameInput, setBusinessNameInput] = useState('');
  const [preferences, setPreferences] = useState<AppPreferences>({
    currency: 'INR', // Default values
    dateFormat: 'DD/MM/YYYY',
    defaultView: 'Dashboard',
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    } catch (error) {
      console.error("Failed to load preferences from localStorage:", error);
      toast({ title: "Error", description: "Could not load saved preferences.", variant: "destructive" });
    }
  }, [toast]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error("Failed to save preferences to localStorage:", error);
      // Optionally notify user, but might be too noisy
    }
  }, [preferences]);

  // Helper to get the appropriate class for font size preview (Copied from AppearanceSettings)
  const getFontSizeClass = (size: typeof fontSize) => {
    switch (size) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  // Update business name input when dialog opens
  useEffect(() => {
    if (isEditingBusinessName) {
      setBusinessNameInput(user?.user_metadata?.business_name || '');
    }
  }, [isEditingBusinessName, user]);

  const handlePreferenceChange = <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleBusinessNameSave = async () => {
    setIsSavingPrefs(true); // Use this state for the dialog save button
    try {
      await updateProfile({ business_name: businessNameInput });
      // AuthContext handles success toast
      setIsEditingBusinessName(false); // Close dialog on success
    } catch (error) {
      // AuthContext handles error toast
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Format date preview based on selected format
  const formatDatePreview = (formatString: DateFormat): string => {
    const now = new Date();
    switch (formatString) {
      case 'MM/DD/YYYY': return format(now, 'MM/dd/yyyy');
      case 'DD/MM/YYYY': return format(now, 'dd/MM/yyyy');
      case 'YYYY-MM-DD': return format(now, 'yyyy-MM-dd');
      case 'DD-MMM-YYYY': return format(now, 'dd-MMM-yyyy');
      default: return format(now, 'PP'); // Default pretty format
    }
  };

  const currentBusinessName = user?.user_metadata?.business_name || 'Not Set';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Preferences</CardTitle>
        <CardDescription>Configure application-wide settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Information */}
        <div className="space-y-2">
          <Label>Business Name</Label>
          <div className="flex items-center justify-between rounded-md border p-3">
            <p className="text-sm font-medium">{currentBusinessName}</p>
            <Dialog open={isEditingBusinessName} onOpenChange={setIsEditingBusinessName}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Business Name</DialogTitle>
                  <DialogDescription>
                    Update the name associated with your business profile.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="businessName" className="sr-only">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessNameInput}
                    onChange={(e) => setBusinessNameInput(e.target.value)}
                    placeholder="Enter business name"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                     <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleBusinessNameSave} disabled={isSavingPrefs || isAuthLoading}>
                    {(isSavingPrefs || isAuthLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Business Name
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="space-y-2">
          <Label htmlFor="currency-select">Currency</Label>
          <Select
            value={preferences.currency}
            onValueChange={(value) => handlePreferenceChange('currency', value as Currency)}
          >
            <SelectTrigger id="currency-select" className="w-full md:w-[280px]">
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.symbol} {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Affects display of monetary values.</p>
        </div>

        {/* Date Format Settings */}
        <div className="space-y-2">
          <Label htmlFor="date-format-select">Date Format</Label>
          <Select
            value={preferences.dateFormat}
            onValueChange={(value) => handlePreferenceChange('dateFormat', value as DateFormat)}
          >
            <SelectTrigger id="date-format-select" className="w-full md:w-[280px]">
              <SelectValue placeholder="Select Date Format" />
            </SelectTrigger>
            <SelectContent>
              {dateFormatOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Preview: {formatDatePreview(preferences.dateFormat)}
          </p>
        </div>

        {/* Default View Settings */}
        <div className="space-y-2">
          <Label htmlFor="default-view-select">Default View</Label>
          <Select
            value={preferences.defaultView}
            onValueChange={(value) => handlePreferenceChange('defaultView', value as DefaultView)}
          >
            <SelectTrigger id="default-view-select" className="w-full md:w-[280px]">
              <SelectValue placeholder="Select Default View" />
            </SelectTrigger>
            <SelectContent>
              {defaultViewOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Initial view when opening the app.</p>
        </div>

        {/* Theme Selection (Moved from AppearanceSettings) */}
        <div className="space-y-2">
          <Label>Theme</Label>
          <RadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as typeof theme)}
            className="grid grid-cols-3 gap-4 pt-2"
          >
            <Label htmlFor="theme-light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
              <RadioGroupItem value="light" id="theme-light" className="sr-only" />
              <Sun className="mb-3 h-6 w-6" />
              Light
            </Label>
            <Label htmlFor="theme-dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
              <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
              <Moon className="mb-3 h-6 w-6" />
              Dark
            </Label>
            <Label htmlFor="theme-system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
              <RadioGroupItem value="system" id="theme-system" className="sr-only" />
              <Laptop className="mb-3 h-6 w-6" />
              System
            </Label>
          </RadioGroup>
        </div>

        {/* Font Size Selection (Moved from AppearanceSettings) */}
        <div className="space-y-2">
          <Label>Font Size</Label>
          <RadioGroup
            value={fontSize}
            onValueChange={(value) => setFontSize(value as typeof fontSize)}
            className="flex items-center space-x-4 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="small" id="font-small" />
              <Label htmlFor="font-small" className="cursor-pointer">Small</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="font-medium" />
              <Label htmlFor="font-medium" className="cursor-pointer">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="font-large" />
              <Label htmlFor="font-large" className="cursor-pointer">Large</Label>
            </div>
          </RadioGroup>
          {/* Font Size Preview */}
          <div className="mt-4 rounded-md border p-4">
            <p className={`font-medium ${getFontSizeClass(fontSize)}`}>
              Preview Text: The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </div>

      </CardContent>
      {/* No explicit save button needed for localStorage prefs or theme/font */}
    </Card>
  );
};

export default PreferencesSettings;
