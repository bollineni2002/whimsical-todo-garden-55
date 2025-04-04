
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SettingsHeader from '@/components/settings/SettingsHeader';
import ProfileSettings from '@/components/settings/ProfileSettings';
import PasswordSettings from '@/components/settings/PasswordSettings';
import PreferencesSettings from '@/components/settings/PreferencesSettings';
import LanguageSettings from '@/components/settings/LanguageSettings';
import SupportSection from '@/components/settings/SupportSection';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const { user, updateProfile } = useAuth();
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
      // Implement password change logic here
      // Placeholder for future implementation
      
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
            <TabsList className="grid grid-cols-4 md:grid-cols-5 border-b rounded-none w-full h-auto p-0">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2 text-sm"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2 text-sm"
              >
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2 text-sm"
              >
                Preferences
              </TabsTrigger>
              <TabsTrigger 
                value="language" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2 text-sm"
              >
                Language
              </TabsTrigger>
              <TabsTrigger 
                value="support" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2 text-sm"
              >
                Support
              </TabsTrigger>
            </TabsList>
            
            <div className="p-4 md:p-6">
              <TabsContent value="profile" className="mt-0">
                <ProfileSettings 
                  user={user}
                  onUpdate={handleProfileUpdate}
                />
              </TabsContent>
              
              <TabsContent value="security" className="mt-0">
                <PasswordSettings 
                  onPasswordChange={handlePasswordChange} 
                />
              </TabsContent>
              
              <TabsContent value="preferences" className="mt-0">
                <PreferencesSettings 
                  businessName={businessName}
                  onBusinessNameChange={handleBusinessNameChange}
                />
              </TabsContent>
              
              <TabsContent value="language" className="mt-0">
                <LanguageSettings 
                  currentLanguage={language}
                  onLanguageChange={handleLanguageChange}
                />
              </TabsContent>
              
              <TabsContent value="support" className="mt-0">
                <SupportSection />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
