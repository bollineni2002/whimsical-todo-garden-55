
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/languages';
import { useTheme } from '@/context/ThemeContext';
import { languages } from '@/lib/languages';
import AuthHeader from '@/components/AuthHeader';
import { 
  ArrowLeft, Save, User, Lock, Globe, DollarSign, 
  Calendar, LayoutDashboard, LayoutList, Sun, Moon, 
  Settings as SettingsIcon, Type
} from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user, updatePassword, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);

  // Profile update state
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);

  // Preferences state
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'USD';
  });
  
  const [selectedDateFormat, setSelectedDateFormat] = useState(() => {
    return localStorage.getItem('dateFormat') || 'MM/DD/YYYY';
  });
  
  const [defaultView, setDefaultView] = useState(() => {
    return localStorage.getItem('defaultView') || 'dashboard';
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
      setPhone(user.user_metadata?.phone || '');
    }
  }, [user]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsPasswordChanging(true);
    try {
      // In a real implementation, we would first verify the old password
      // before updating to the new password
      await updatePassword(newPassword);
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Failed to update password",
        description: error.message || "An error occurred while updating your password.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProfileUpdating(true);
    try {
      await updateProfile({ 
        name, 
        email,
        phone
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update profile",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsProfileUpdating(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      // Save preferences to localStorage
      localStorage.setItem('currency', selectedCurrency);
      localStorage.setItem('dateFormat', selectedDateFormat);
      localStorage.setItem('defaultView', defaultView);
      
      toast({
        title: "Preferences saved",
        description: "Your preferences have been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Failed to save preferences",
        description: "An error occurred while saving your preferences.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthHeader 
        businessName="TransactLy" 
        onEditName={() => {}} 
      />
      
      <div className="container max-w-4xl mx-auto flex-1 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">{t('settings')}</h1>
            </div>
          </div>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{t('profile')}</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden md:inline">{t('change_password')}</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden md:inline">{t('language')}</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden md:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden md:inline">Preferences</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile')}</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-name">{t('name')}</Label>
                      <Input
                        id="profile-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-email">{t('email')}</Label>
                      <Input
                        id="profile-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-phone">{t('phone')}</Label>
                      <Input
                        id="profile-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1234567890"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full mt-4"
                      disabled={isProfileUpdating}
                    >
                      {isProfileUpdating ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Password Tab */}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>{t('change_password')}</CardTitle>
                  <CardDescription>
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="old-password">{t('old_password')}</Label>
                      <Input
                        id="old-password"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter your current password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">{t('new_password')}</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{t('confirm_password')}</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full mt-4"
                      disabled={isPasswordChanging || !oldPassword || !newPassword || !confirmPassword}
                    >
                      {isPasswordChanging ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Language Tab */}
            <TabsContent value="language">
              <Card>
                <CardHeader>
                  <CardTitle>{t('language')}</CardTitle>
                  <CardDescription>
                    Select your preferred language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language-select">{t('language')}</Label>
                      <Select
                        value={language}
                        onValueChange={(value) => setLanguage(value as any)}
                      >
                        <SelectTrigger id="language-select">
                          <SelectValue placeholder="Select language" />
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
                    
                    <div className="rounded-lg bg-muted p-4 mt-4">
                      <p className="text-sm text-muted-foreground">
                        More language features coming soon. Stay tuned for enhanced localization support!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how the application looks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Theme Selection */}
                    <div className="space-y-2">
                      <Label>{t('theme')}</Label>
                      <ToggleGroup type="single" value={theme} onValueChange={(value) => value && setTheme(value as 'light' | 'dark' | 'system')}>
                        <ToggleGroupItem value="light" className="flex items-center gap-2 flex-1 justify-center">
                          <Sun className="h-4 w-4" />
                          <span>Light</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="dark" className="flex items-center gap-2 flex-1 justify-center">
                          <Moon className="h-4 w-4" />
                          <span>Dark</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="system" className="flex items-center gap-2 flex-1 justify-center">
                          <SettingsIcon className="h-4 w-4" />
                          <span>System</span>
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    
                    {/* Font Size Settings */}
                    <div className="space-y-2">
                      <Label htmlFor="font-size">{t('font_size')}</Label>
                      <Select
                        value={fontSize}
                        onValueChange={(value) => setFontSize(value as 'small' | 'medium' | 'large')}
                      >
                        <SelectTrigger id="font-size" className="w-full">
                          <div className="flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            <SelectValue placeholder="Select font size" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-4 rounded-lg bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                          This is a preview of the current font size setting. Adjust it to your preference.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Application Preferences</CardTitle>
                  <CardDescription>
                    Customize how the application behaves
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Currency Preferences */}
                    <div className="space-y-2">
                      <Label htmlFor="currency">{t('currency')}</Label>
                      <Select
                        value={selectedCurrency}
                        onValueChange={setSelectedCurrency}
                      >
                        <SelectTrigger id="currency" className="w-full">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <SelectValue placeholder="Select currency" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="JPY">JPY (¥)</SelectItem>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Date Format Preferences */}
                    <div className="space-y-2">
                      <Label htmlFor="date-format">{t('date_format')}</Label>
                      <Select
                        value={selectedDateFormat}
                        onValueChange={setSelectedDateFormat}
                      >
                        <SelectTrigger id="date-format" className="w-full">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <SelectValue placeholder="Select date format" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Default View */}
                    <div className="space-y-2">
                      <Label htmlFor="default-view">{t('default_view')}</Label>
                      <ToggleGroup 
                        type="single" 
                        value={defaultView}
                        onValueChange={(value) => value && setDefaultView(value)}
                        className="justify-start"
                      >
                        <ToggleGroupItem value="dashboard" className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Dashboard View</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="list" className="flex items-center gap-2">
                          <LayoutList className="h-4 w-4" />
                          <span>List View</span>
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    
                    <Button 
                      onClick={handlePreferencesUpdate}
                      className="w-full mt-4"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {t('save')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
