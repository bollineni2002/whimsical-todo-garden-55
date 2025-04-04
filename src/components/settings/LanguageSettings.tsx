
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

const LanguageSettings = () => {
  const { language, setLanguage, t } = useLanguage();

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
            value={language}
            onValueChange={(value) => setLanguage(value as typeof language)}
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
