
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage, languages } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ChevronLeft, 
  Check, 
  User, 
  Shield, 
  Globe, 
  Moon, 
  Sun, 
  CreditCard, 
  Calendar, 
  LayoutDashboard, 
  Settings as SettingsIcon,
  Sliders,
  Coffee,
  Loader
} from 'lucide-react';

// Define form types
interface ProfileFormValues {
  fullName: string;
  email: string;
  phone: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface BusinessInfoFormValues {
  businessName: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState({
    profile: false,
    password: false,
    business: false,
    preferences: false
  });
  
  // Theme context
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  
  // Language context
  const { currentLanguage, setLanguage, getLanguageLabel } = useLanguage();
  
  // Currency context
  const { currency, setCurrency } = useCurrency();
  
  // Business info state
  const [businessName, setBusinessName] = useState<string>(() => {
    return localStorage.getItem('businessName') || 'TransactLy';
  });
  
  // Date format state
  const [dateFormat, setDateFormat] = useState<string>(() => {
    return localStorage.getItem('dateFormat') || 'DD/MM/YYYY';
  });
  
  // Default view state
  const [defaultView, setDefaultView] = useState<string>(() => {
    return localStorage.getItem('defaultView') || 'dashboard';
  });
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // Business info form
  const businessForm = useForm<BusinessInfoFormValues>({
    defaultValues: {
      businessName: businessName,
    },
  });

  // Handle profile form submission
  const handleProfileSubmit = async (values: ProfileFormValues) => {
    setIsLoading(prev => ({ ...prev, profile: true }));
    try {
      // In a real app, this would update the user's profile in Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, profile: false }));
    }
  };
  
  // Handle password form submission
  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    if (values.newPassword !== values.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(prev => ({ ...prev, password: true }));
    try {
      // In a real app, this would verify the current password before updating
      // For now, we'll just simulate the API call
      await updatePassword(values.newPassword);
      
      // Clear the form
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please check your current password and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, password: false }));
    }
  };
  
  // Handle business info form submission
  const handleBusinessInfoSubmit = async (values: BusinessInfoFormValues) => {
    setIsLoading(prev => ({ ...prev, business: true }));
    try {
      localStorage.setItem('businessName', values.businessName);
      setBusinessName(values.businessName);
      
      toast({
        title: "Business Information Updated",
        description: "Your business information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update business information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, business: false }));
    }
  };
  
  // Handle saving preferences
  const handleSavePreferences = () => {
    setIsLoading(prev => ({ ...prev, preferences: true }));
    try {
      localStorage.setItem('currency', currency);
      localStorage.setItem('dateFormat', dateFormat);
      localStorage.setItem('defaultView', defaultView);
      
      toast({
        title: "Preferences Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, preferences: false }));
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" onClick={() => navigate('/')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">TransactLy Settings</h1>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 overflow-x-auto scrollbar-hide">
          <TabsTrigger value="profile" icon={<User className="h-4 w-4" />}>Profile</TabsTrigger>
          <TabsTrigger value="password" icon={<Shield className="h-4 w-4" />}>Password</TabsTrigger>
          <TabsTrigger value="language" icon={<Globe className="h-4 w-4" />}>Language</TabsTrigger>
          <TabsTrigger value="appearance" icon={<Moon className="h-4 w-4" />}>Appearance</TabsTrigger>
          <TabsTrigger value="preferences" icon={<SettingsIcon className="h-4 w-4" />}>Preferences</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Manage your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Your email address" 
                            {...field}
                            disabled 
                          />
                        </FormControl>
                        <FormDescription>
                          Your email address is used for login and cannot be changed here
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="Your phone number" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Include country code (e.g., +1 for US)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading.profile}
                  >
                    {isLoading.profile ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Your current password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Your new password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 8 characters long
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Confirm your new password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading.password}
                  >
                    {isLoading.password ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
              <CardDescription>
                Choose your preferred language for the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label htmlFor="language" className="text-sm font-medium">Select Language</label>
                  <Select
                    value={currentLanguage}
                    onValueChange={(value: any) => setLanguage(value)}
                  >
                    <SelectTrigger id="language" className="w-full">
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
                  <p className="text-sm text-muted-foreground">
                    Currently selected: {getLanguageLabel(currentLanguage)}
                  </p>
                </div>
              </div>
              
              <div className="rounded-md bg-muted p-4">
                <h3 className="mb-2 font-medium">Preview:</h3>
                <p className="text-sm">
                  This text is shown in your selected language. In a complete application, 
                  all text would be translated to {getLanguageLabel(currentLanguage)}.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Choose your preferred theme for the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      variant={theme === 'light' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button 
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                    <Button 
                      variant={theme === 'system' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setTheme('system')}
                    >
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      System
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <label className="text-sm font-medium">Font Size</label>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      variant={fontSize === 'small' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setFontSize('small')}
                    >
                      <span className="text-xs">Small</span>
                    </Button>
                    <Button 
                      variant={fontSize === 'medium' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setFontSize('medium')}
                    >
                      <span>Medium</span>
                    </Button>
                    <Button 
                      variant={fontSize === 'large' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setFontSize('large')}
                    >
                      <span className="text-lg">Large</span>
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md bg-muted p-4 mt-4">
                  <h3 className="mb-2 font-medium">Preview:</h3>
                  <p>
                    This is how text will look with your current settings.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Caption text and secondary information will appear like this.
                  </p>
                  <div className="mt-2 p-2 bg-background rounded border">
                    <p className="font-medium">Example card content</p>
                    <p className="text-sm text-muted-foreground">With your current theme and font size</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Manage your business details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...businessForm}>
                <form onSubmit={businessForm.handleSubmit(handleBusinessInfoSubmit)} className="space-y-4">
                  <FormField
                    control={businessForm.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your business name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This name will be displayed in the application header
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading.business}
                  >
                    {isLoading.business ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save Business Info
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>
                Configure how the application works for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <Select
                    value={currency}
                    onValueChange={(value) => setCurrency(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                      <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Format</label>
                  <Select
                    value={dateFormat}
                    onValueChange={setDateFormat}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Date Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (American)</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (European)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                      <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY (Long format)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Preview: {new Date().toLocaleDateString(
                      dateFormat === 'DD-MMM-YYYY' ? 'en-GB' : undefined, 
                      dateFormat === 'YYYY-MM-DD' 
                        ? { year: 'numeric', month: '2-digit', day: '2-digit' } 
                        : dateFormat === 'DD-MMM-YYYY'
                          ? { day: '2-digit', month: 'short', year: 'numeric' }
                          : undefined
                    )}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default View</label>
                  <Select
                    value={defaultView}
                    onValueChange={setDefaultView}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Default View" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">
                        <div className="flex items-center">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard View
                        </div>
                      </SelectItem>
                      <SelectItem value="list">
                        <div className="flex items-center">
                          <Sliders className="h-4 w-4 mr-2" />
                          List View
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleSavePreferences} 
                  disabled={isLoading.preferences}
                >
                  {isLoading.preferences ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Saving Preferences...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Support Section */}
          <Card>
            <CardHeader>
              <CardTitle>Support the Development</CardTitle>
              <CardDescription>
                Help us keep the app ad-free
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mx-auto w-32 h-32 mb-4 bg-muted rounded-lg flex items-center justify-center">
                <Coffee className="h-16 w-16 text-muted-foreground" />
                {/* In a real app, this would be a QR code */}
              </div>
              <p className="mb-4">
                If you find this app useful, consider buying me a coffee to support ongoing development.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>
                    <Coffee className="mr-2 h-4 w-4" />
                    Buy Me a Coffee
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Thank You!</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your support helps keep this application ad-free and continuously improved.
                      In a real app, this would redirect to a payment page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Maybe Later</AlertDialogCancel>
                    <AlertDialogAction>
                      <Coffee className="mr-2 h-4 w-4" />
                      Support Now
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
