
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SettingsHeader from '@/components/settings/SettingsHeader';
import ProfileSettings from '@/components/settings/ProfileSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import DataManagementSettings from '@/components/settings/DataManagementSettings';
import ImportExportSettings from '@/components/settings/ImportExportSettings';
import SupportSection from '@/components/settings/SupportSection';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Check if there's a saved tab in the URL or use 'profile' as default
    const hash = window.location.hash.replace('#', '');
    return ['profile', 'appearance', 'data-management', 'import-export'].includes(hash) ? hash : 'profile';
  });
  const { user, updateProfile, updatePassword } = useAuth();
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState<string>('TransactLy');
  const [language, setLanguage] = useState<string>('en');

  useEffect(() => {
    // Load saved settings from localStorage
    const loadSettings = async () => {
      try {
        const savedBusinessName = await localStorage.getItem('businessName');
        const savedLanguage = await localStorage.getItem('language');

        if (savedBusinessName) {
          setBusinessName(savedBusinessName);
        }

        if (savedLanguage) {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Update URL hash when tab changes
  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  const handleProfileUpdate = async (profileData: { name: string; phone: string }) => {
    try {
      // Update profile using the AuthContext method
      await updateProfile({
        name: profileData.name,
        phone: profileData.phone
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      // Implement password change logic
      // First verify the current password (this would be handled in the PasswordSettings component)
      // Then update the password
      await updatePassword(newPassword);

      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Change Failed',
        description: 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBusinessNameChange = async (newName: string) => {
    try {
      setBusinessName(newName);
      await localStorage.setItem('businessName', newName);

      toast({
        title: 'Business Name Updated',
        description: 'Your business name has been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving business name:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update business name. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    try {
      setLanguage(newLanguage);
      await localStorage.setItem('language', newLanguage);

      toast({
        title: 'Language Updated',
        description: 'Your language preference has been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving language preference:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update language preference. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 max-w-6xl">
      <SettingsHeader />

      <Card className="mt-6">
        <CardHeader className="pb-4">
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your account settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs
            defaultValue="profile"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 border-b rounded-none w-full h-auto p-0 overflow-x-auto scrollbar-hide settings-tabs">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2 text-sm whitespace-nowrap settings-tab"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2 text-sm whitespace-nowrap settings-tab"
              >
                Appearance
              </TabsTrigger>
              <TabsTrigger
                value="data-management"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2 text-sm whitespace-nowrap settings-tab"
              >
                Data Management
              </TabsTrigger>
              <TabsTrigger
                value="import-export"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2 text-sm whitespace-nowrap settings-tab"
              >
                Import/Export
              </TabsTrigger>
            </TabsList>

            <div className="p-4 md:p-6">
              <TabsContent value="profile" className="mt-0">
                <ProfileSettings
                  user={user}
                  onUpdate={handleProfileUpdate}
                  onPasswordChange={handlePasswordChange}
                />
              </TabsContent>

              <TabsContent value="appearance" className="mt-0">
                <AppearanceSettings
                  businessName={businessName}
                  onBusinessNameChange={handleBusinessNameChange}
                />
              </TabsContent>

              <TabsContent value="data-management" className="mt-0">
                <DataManagementSettings
                  userId={user?.id}
                />
              </TabsContent>

              <TabsContent value="import-export" className="mt-0">
                <ImportExportSettings
                  userId={user?.id}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
