import React from 'react';
import { useLanguage, languages } from '@/lib/languages'; // Import context hook and languages array
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const LanguageSettings = () => {
  const { language, setLanguage, t } = useLanguage(); // Use the language context

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('language')}</CardTitle> {/* Use translation key */}
        <CardDescription>Choose your preferred language for the application.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="language-select">{t('language')}</Label> {/* Use translation key */}
          <Select
            value={language}
            onValueChange={(value) => setLanguage(value as typeof language)} // Cast value to LanguageCode type
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
      {/* No footer/save button needed as changes apply immediately */}
    </Card>
  );
};

export default LanguageSettings;
