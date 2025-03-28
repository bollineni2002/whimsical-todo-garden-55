
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { languages, useLanguage, LanguageCode } from '@/lib/languages';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { currencies, dateFormats } from '@/context/UserPreferencesContext';

const Settings = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const { preferences, updatePreferences, isLoading } = useUserPreferences();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  // User profile state
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone_number || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleProfileUpdate = async () => {
    setIsUpdatingProfile(true);
    try {
      const { error } = await updateProfile({ name, phone });
      if (!error) {
        toast({
          title: "Success",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await updatePassword(oldPassword, newPassword);
      if (!error) {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast({
          title: "Success",
          description: "Your password has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLanguageChange = (value: LanguageCode) => {
    setLanguage(value);
    updatePreferences({ language: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">{t('settings')}</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-2">
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
          <TabsTrigger value="password">{t('change_password')}</TabsTrigger>
          <TabsTrigger value="language">{t('language')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('theme')}</TabsTrigger>
          <TabsTrigger value="preferences">{t('currency')}</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile')}</CardTitle>
              <CardDescription>
                Manage your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={user?.email} 
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Your phone number"
                />
              </div>
              <Button 
                className="w-full sm:w-auto mt-4" 
                onClick={handleProfileUpdate}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Updating..." : t('save')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Settings */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>{t('change_password')}</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('old_password')}</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('new_password')}</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button 
                className="w-full sm:w-auto mt-4" 
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !oldPassword || !newPassword || !confirmPassword}
              >
                {isChangingPassword ? "Updating..." : t('save')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Settings */}
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>{t('language')}</CardTitle>
              <CardDescription>
                Choose your preferred language for the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={language} 
                onValueChange={(value) => handleLanguageChange(value as LanguageCode)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {languages.map((lang) => (
                  <div key={lang.code} className="flex items-center space-x-2">
                    <RadioGroupItem value={lang.code} id={`lang-${lang.code}`} />
                    <Label htmlFor={`lang-${lang.code}`} className="flex items-center">
                      <span className="mr-2">{lang.nativeName}</span>
                      <span className="text-muted-foreground text-sm">({lang.name})</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t('theme')}</CardTitle>
              <CardDescription>
                Customize the appearance of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{t('theme')}</Label>
                <RadioGroup 
                  value={preferences.theme} 
                  onValueChange={(value) => updatePreferences({ theme: value as any })}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="border rounded-md p-2 w-full bg-background">
                      <div className="flex justify-between">
                        <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                        <div className="h-4 w-4 rounded-full bg-primary"></div>
                        <div className="h-4 w-4 rounded-full bg-gray-300"></div>
                      </div>
                    </div>
                    <Label htmlFor="theme-light">Light</Label>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="border rounded-md p-2 w-full bg-gray-950">
                      <div className="flex justify-between">
                        <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                        <div className="h-4 w-4 rounded-full bg-blue-400"></div>
                        <div className="h-4 w-4 rounded-full bg-gray-600"></div>
                      </div>
                    </div>
                    <Label htmlFor="theme-dark">Dark</Label>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="border rounded-md p-2 w-full bg-gradient-to-r from-white to-gray-950">
                      <div className="flex justify-between">
                        <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                        <div className="h-4 w-4 rounded-full bg-primary"></div>
                        <div className="h-4 w-4 rounded-full bg-gray-600"></div>
                      </div>
                    </div>
                    <Label htmlFor="theme-system">System</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>{t('font_size')}</Label>
                <RadioGroup 
                  value={preferences.fontSize} 
                  onValueChange={(value) => updatePreferences({ fontSize: value as any })}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="text-small" />
                    <Label htmlFor="text-small" className="text-sm">Small</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="text-medium" />
                    <Label htmlFor="text-medium" className="text-base">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="text-large" />
                    <Label htmlFor="text-large" className="text-lg">Large</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Settings */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your experience with different formats and views.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{t('currency')}</Label>
                <Select 
                  value={preferences.currency} 
                  onValueChange={(value) => updatePreferences({ currency: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>{t('date_format')}</Label>
                <Select 
                  value={preferences.dateFormat}
                  onValueChange={(value) => updatePreferences({ dateFormat: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFormats.map(format => (
                      <SelectItem key={format.code} value={format.code}>
                        {format.code} ({format.example})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>{t('default_view')}</Label>
                <RadioGroup 
                  value={preferences.defaultView}
                  onValueChange={(value) => updatePreferences({ defaultView: value as any })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dashboard" id="view-dashboard" />
                    <Label htmlFor="view-dashboard">Dashboard</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="list" id="view-list" />
                    <Label htmlFor="view-list">List</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
