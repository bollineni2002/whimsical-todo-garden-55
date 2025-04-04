
import React from 'react';
import { useLanguage, languages } from '@/lib/languages';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface LanguageSettingsProps {
  currentLanguage?: string;
  onLanguageChange?: (newLanguage: string) => Promise<void>;
}

const LanguageSettings = ({ currentLanguage, onLanguageChange }: LanguageSettingsProps) => {
  const { language, setLanguage, t } = useLanguage();
  
  const handleLanguageChange = async (value: string) => {
    // If onLanguageChange prop is provided, use it
    if (onLanguageChange) {
      await onLanguageChange(value);
    }
    
    // Always update the language in the context
    setLanguage(value as typeof language);
  };

  // Use the prop value if provided, otherwise use the context value
  const displayLanguage = currentLanguage || language;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('language')}</CardTitle>
        <CardDescription>Choose your preferred language for the application.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="language-select">{t('language')}</Label>
          <Select
            value={displayLanguage}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger id="language-select" className="w-full md:w-[280px]">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSettings;
