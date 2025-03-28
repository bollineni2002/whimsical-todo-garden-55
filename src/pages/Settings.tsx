
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AuthHeader from '@/components/AuthHeader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, languages } from '@/lib/languages';
import { 
  ArrowLeft, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  Languages, 
  CreditCard, 
  CalendarDays, 
  LayoutDashboard, 
  Moon, 
  Sun, 
  Monitor, 
  Type,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  useUserPreferences, 
  currencies, 
  dateFormats, 
  FontSizeType,
  ThemeType,
  ViewType,
  CurrencyCode,
  DateFormatType
} from '@/context/UserPreferencesContext';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updatePassword, updateProfile, isLoading } = useAuth();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const { preferences, updatePreferences, isLoading: prefsLoading } = useUserPreferences();

  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || user.user_metadata?.phone || '');
    }
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = async () => {
    setIsUpdatingProfile(true);
    try {
      await updateProfile({ name, phone });
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Could not update profile.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Your new password and confirmation password do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      // In a real implementation, we would verify the old password server-side
      await updatePassword(newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description: error.message || "Could not update password.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthHeader businessName="TransactLy" onEditName={() => {}} />
      
      <div className="container max-w-4xl mx-auto flex-1 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back_to_dashboard')}
            </Button>
            <h1 className="text-3xl font-bold">{t('settings')}</h1>
          </div>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 w-full">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{t('profile')}</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">{t('change_password')}</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <span className="hidden sm:inline">{t('language')}</span>
              </TabsTrigger>
              <TabsTrigger value="currency" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">{t('currency')}</span>
              </TabsTrigger>
              <TabsTrigger value="date" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">{t('date_format')}</span>
              </TabsTrigger>
              <TabsTrigger value="view" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">{t('default_view')}</span>
              </TabsTrigger>
              <TabsTrigger value="theme" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span className="hidden sm:inline">{t('theme')}</span>
              </TabsTrigger>
              <TabsTrigger value="font" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <span className="hidden sm:inline">{t('font_size')}</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Settings */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile')}</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('name')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={email}
                        disabled
                        className="pl-10 bg-muted"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleProfileUpdate} 
                    disabled={isUpdatingProfile}
                    className="w-full mt-4"
                  >
                    {isUpdatingProfile ? 'Updating...' : t('save')}
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
                    Update your password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">{t('old_password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="current-password"
                        type={showPasswords ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-3 text-muted-foreground"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{t('new_password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showPasswords ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-3 text-muted-foreground"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t('confirm_password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showPasswords ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-3 text-muted-foreground"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handlePasswordChange} 
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="w-full mt-4"
                  >
                    {isChangingPassword ? 'Updating...' : t('save')}
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
                    Choose your preferred language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {languages.map((lang) => (
                        <div key={lang.code} className="flex items-center space-x-2">
                          <Button
                            variant={language === lang.code ? "default" : "outline"}
                            onClick={() => {
                              setLanguage(lang.code);
                              updatePreferences({ language: lang.code });
                            }}
                            className="w-full justify-start"
                          >
                            <span className="mr-2">{lang.nativeName}</span>
                            <span className="text-xs text-muted-foreground">({lang.name})</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Currency Settings */}
            <TabsContent value="currency">
              <Card>
                <CardHeader>
                  <CardTitle>{t('currency')}</CardTitle>
                  <CardDescription>
                    Select your preferred currency format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={preferences.currency} 
                    onValueChange={(value) => updatePreferences({ currency: value as CurrencyCode })}
                    className="space-y-3"
                  >
                    {currencies.map((currency) => (
                      <div key={currency.code} className="flex items-center space-x-2">
                        <RadioGroupItem value={currency.code} id={`currency-${currency.code}`} />
                        <Label htmlFor={`currency-${currency.code}`} className="flex items-center">
                          <span className="text-xl mr-2">{currency.symbol}</span>
                          <span>{currency.name}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Date Format Settings */}
            <TabsContent value="date">
              <Card>
                <CardHeader>
                  <CardTitle>{t('date_format')}</CardTitle>
                  <CardDescription>
                    Choose how dates are displayed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={preferences.dateFormat} 
                    onValueChange={(value) => updatePreferences({ dateFormat: value as DateFormatType })}
                    className="space-y-3"
                  >
                    {dateFormats.map((format) => (
                      <div key={format.code} className="flex items-center space-x-2">
                        <RadioGroupItem value={format.code} id={`date-${format.code}`} />
                        <Label htmlFor={`date-${format.code}`} className="flex items-center">
                          <span className="font-mono mr-2">{format.code}</span>
                          <span className="text-muted-foreground">({format.example})</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Default View Settings */}
            <TabsContent value="view">
              <Card>
                <CardHeader>
                  <CardTitle>{t('default_view')}</CardTitle>
                  <CardDescription>
                    Choose your preferred default view
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      variant={preferences.defaultView === 'dashboard' ? "default" : "outline"}
                      onClick={() => updatePreferences({ defaultView: 'dashboard' })}
                      className="h-24 flex flex-col items-center justify-center"
                    >
                      <LayoutDashboard className="h-8 w-8 mb-2" />
                      <span>Dashboard View</span>
                    </Button>
                    
                    <Button
                      variant={preferences.defaultView === 'list' ? "default" : "outline"}
                      onClick={() => updatePreferences({ defaultView: 'list' })}
                      className="h-24 flex flex-col items-center justify-center"
                    >
                      <ul className="h-8 w-8 mb-2 flex flex-col items-center justify-center space-y-1">
                        <li className="w-6 h-1 bg-current rounded-full"></li>
                        <li className="w-6 h-1 bg-current rounded-full"></li>
                        <li className="w-6 h-1 bg-current rounded-full"></li>
                      </ul>
                      <span>List View</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Theme Settings */}
            <TabsContent value="theme">
              <Card>
                <CardHeader>
                  <CardTitle>{t('theme')}</CardTitle>
                  <CardDescription>
                    Choose your preferred theme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button
                      variant={preferences.theme === 'light' ? "default" : "outline"}
                      onClick={() => updatePreferences({ theme: 'light' })}
                      className="h-24 flex flex-col items-center justify-center"
                    >
                      <Sun className="h-8 w-8 mb-2" />
                      <span>Light Mode</span>
                    </Button>
                    
                    <Button
                      variant={preferences.theme === 'dark' ? "default" : "outline"}
                      onClick={() => updatePreferences({ theme: 'dark' })}
                      className="h-24 flex flex-col items-center justify-center"
                    >
                      <Moon className="h-8 w-8 mb-2" />
                      <span>Dark Mode</span>
                    </Button>
                    
                    <Button
                      variant={preferences.theme === 'system' ? "default" : "outline"}
                      onClick={() => updatePreferences({ theme: 'system' })}
                      className="h-24 flex flex-col items-center justify-center"
                    >
                      <Monitor className="h-8 w-8 mb-2" />
                      <span>System Default</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Font Size Settings */}
            <TabsContent value="font">
              <Card>
                <CardHeader>
                  <CardTitle>{t('font_size')}</CardTitle>
                  <CardDescription>
                    Select your preferred text size
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">A</span>
                      <span className="text-xl">A</span>
                    </div>
                    <RadioGroup 
                      value={preferences.fontSize} 
                      onValueChange={(value) => updatePreferences({ fontSize: value as FontSizeType })}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small" id="font-small" className="peer sr-only" />
                        <Label 
                          htmlFor="font-small" 
                          className="flex flex-col items-center justify-center h-24 w-full rounded-md border-2 border-muted bg-transparent px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer"
                        >
                          <Type className="h-6 w-6 mb-2" />
                          <span className="text-sm">Small</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="font-medium" className="peer sr-only" />
                        <Label 
                          htmlFor="font-medium" 
                          className="flex flex-col items-center justify-center h-24 w-full rounded-md border-2 border-muted bg-transparent px-3 py-2 text-base ring-offset-background hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer"
                        >
                          <Type className="h-7 w-7 mb-2" />
                          <span className="text-base">Medium</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="font-large" className="peer sr-only" />
                        <Label 
                          htmlFor="font-large" 
                          className="flex flex-col items-center justify-center h-24 w-full rounded-md border-2 border-muted bg-transparent px-3 py-2 text-lg ring-offset-background hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer"
                        >
                          <Type className="h-8 w-8 mb-2" />
                          <span className="text-lg">Large</span>
                        </Label>
                      </div>
                    </RadioGroup>
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
