import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Lock,
  Languages,
  Palette,
  SlidersHorizontal,
  ChevronLeft,
} from 'lucide-react';

// Import the new setting components
import SettingsHeader from '@/components/settings/SettingsHeader';
import ProfileSettings from '@/components/settings/ProfileSettings';
import PasswordSettings from '@/components/settings/PasswordSettings';
import LanguageSettings from '@/components/settings/LanguageSettings';
// import AppearanceSettings from '@/components/settings/AppearanceSettings'; // Removed
import PreferencesSettings from '@/components/settings/PreferencesSettings';
import SupportSection from '@/components/settings/SupportSection';

const Settings = () => {
  const navigate = useNavigate();

  // Default tab can be set here, e.g., "profile"
  const defaultTab = "profile";

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Render the new header */}
      <SettingsHeader />

      <Tabs defaultValue={defaultTab} className="w-full mt-6">
        {/* Force 4 columns even on smallest screens */}
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock className="mr-2 h-4 w-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="language">
            <Languages className="mr-2 h-4 w-4" />
            Language
          </TabsTrigger>
          {/* Removed Appearance Tab */}
          <TabsTrigger value="preferences">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="password">
          <PasswordSettings />
        </TabsContent>

        <TabsContent value="language">
          <LanguageSettings />
        </TabsContent>

        {/* Removed Appearance Content */}

        <TabsContent value="preferences">
          <PreferencesSettings />
        </TabsContent>
      </Tabs>

      {/* Render the support section below the tabs */}
      <div className="mt-8">
        <SupportSection />
      </div>
    </div>
  );
};

export default Settings;
