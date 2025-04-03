
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  User, 
  Lock, 
  Globe, 
  Palette, 
  Settings as SettingsIcon,
  Check, 
  Loader2, 
  Coffee,
  Sun,
  Moon,
  Laptop,
  CreditCard,
  Calendar,
  Grid3x3,
  List,
  Pencil
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Custom hooks and contexts
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage, LanguageCode, AVAILABLE_LANGUAGES } from '@/context/LanguageContext';

// Form validation
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Profile form schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
});

// Password form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Please confirm your new password." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, updatePassword, updateProfile } = useAuth();
  const { theme, setTheme, fontSize, setFontSize, isDarkMode } = useTheme();
  const { currency, setCurrency, formatCurrency } = useCurrency();
  const { language, changeLanguage, getLanguageLabel, availableLanguages } = useLanguage();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isBusinessNameDialogOpen, setIsBusinessNameDialogOpen] = useState(false);
  const [businessName, setBusinessName] = useState('TransactLy');
  const [dateFormat, setDateFormat] = useState<string>('DD/MM/YYYY');
  const [defaultView, setDefaultView] = useState<string>('dashboard');

  // QR code for support
  const supportQRCode = 'data:image/png;base64,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';

  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Load user settings from localStorage and Supabase on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load business name from localStorage
        const savedBusinessName = localStorage.getItem('businessName');
        if (savedBusinessName) {
          setBusinessName(savedBusinessName);
        }

        // Load date format from localStorage
        const savedDateFormat = localStorage.getItem('dateFormat');
        if (savedDateFormat) {
          setDateFormat(savedDateFormat);
        }

        // Load default view from localStorage
        const savedDefaultView = localStorage.getItem('defaultView');
        if (savedDefaultView) {
          setDefaultView(savedDefaultView);
        }

        // Set profile form defaults from user data if available
        if (user) {
          profileForm.reset({
            fullName: user.user_metadata?.full_name || '',
            email: user.email || '',
            phone: user.user_metadata?.phone || '',
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [user, profileForm, toast]);

  // Handle profile form submission
  const onSubmitProfile = async (data: z.infer<typeof profileFormSchema>) => {
    setIsSaving(true);
    try {
      // Save profile data to Supabase
      await updateProfile({
        full_name: data.fullName,
        phone: data.phone || undefined,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password form submission
  const onSubmitPassword = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsChangingPassword(true);
    try {
      await updatePassword(data.currentPassword, data.newPassword);
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
      
      // Reset form after successful update
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error('Failed to update password:', error);
      toast({
        title: "Error",
        description: "Failed to update password. Please verify your current password.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle business name change
  const handleSaveBusinessName = async () => {
    try {
      localStorage.setItem('businessName', businessName);
      setIsBusinessNameDialogOpen(false);
      
      toast({
        title: "Business Name Updated",
        description: "Your business name has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to save business name:', error);
      toast({
        title: "Error",
        description: "Failed to update business name.",
        variant: "destructive",
      });
    }
  };

  // Handle date format change
  const handleDateFormatChange = (format: string) => {
    setDateFormat(format);
    localStorage.setItem('dateFormat', format);

    toast({
      title: "Date Format Updated",
      description: "Your date format preference has been saved.",
    });
  };

  // Handle default view change
  const handleDefaultViewChange = (view: string) => {
    setDefaultView(view);
    localStorage.setItem('defaultView', view);

    toast({
      title: "Default View Updated",
      description: "Your default view preference has been saved.",
    });
  };

  // Format date according to selected format
  const formatDate = (date: Date, format: string) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    const year = date.getFullYear();
    
    switch (format) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD-MMM-YYYY':
        return `${day}-${monthName}-${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto p-4 max-w-4xl min-h-screen"
    >
      {/* Header section */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" onClick={() => navigate('/')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 overflow-auto">
          <TabsTrigger value="profile" icon={<User className="w-4 h-4" />}>
            Profile
          </TabsTrigger>
          <TabsTrigger value="password" icon={<Lock className="w-4 h-4" />}>
            Password
          </TabsTrigger>
          <TabsTrigger value="language" icon={<Globe className="w-4 h-4" />}>
            Language
          </TabsTrigger>
          <TabsTrigger value="appearance" icon={<Palette className="w-4 h-4" />}>
            Appearance
          </TabsTrigger>
          <TabsTrigger value="preferences" icon={<SettingsIcon className="w-4 h-4" />}>
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
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
                          <Input placeholder="Enter your email" {...field} disabled />
                        </FormControl>
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
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
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
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter current password" {...field} />
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
                          <Input type="password" placeholder="Enter new password" {...field} />
                        </FormControl>
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
                          <Input type="password" placeholder="Confirm new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Display Language</Label>
                  <Select
                    value={language}
                    onValueChange={(value) => changeLanguage(value as LanguageCode)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(availableLanguages).map(([code, names]) => (
                        <SelectItem key={code} value={code}>
                          {names.native} ({names.english})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-4 border rounded-md bg-muted/20">
                  <p className="text-sm font-medium mb-2">Preview</p>
                  <p className="text-sm text-muted-foreground">
                    Currently using: <span className="font-medium">{getLanguageLabel(language)}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant={theme === 'light' ? "default" : "outline"} 
                    className="justify-start"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Light Mode
                    {theme === 'light' && <Check className="ml-auto h-4 w-4" />}
                  </Button>
                  
                  <Button 
                    variant={theme === 'dark' ? "default" : "outline"} 
                    className="justify-start"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark Mode
                    {theme === 'dark' && <Check className="ml-auto h-4 w-4" />}
                  </Button>
                  
                  <Button 
                    variant={theme === 'system' ? "default" : "outline"} 
                    className="justify-start"
                    onClick={() => setTheme('system')}
                  >
                    <Laptop className="mr-2 h-4 w-4" />
                    System
                    {theme === 'system' && <Check className="ml-auto h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Font Size</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant={fontSize === 'small' ? "default" : "outline"} 
                    className="justify-start"
                    onClick={() => setFontSize('small')}
                  >
                    <span className="mr-2 text-xs">Aa</span>
                    Small
                    {fontSize === 'small' && <Check className="ml-auto h-4 w-4" />}
                  </Button>
                  
                  <Button 
                    variant={fontSize === 'medium' ? "default" : "outline"} 
                    className="justify-start"
                    onClick={() => setFontSize('medium')}
                  >
                    <span className="mr-2 text-sm">Aa</span>
                    Medium
                    {fontSize === 'medium' && <Check className="ml-auto h-4 w-4" />}
                  </Button>
                  
                  <Button 
                    variant={fontSize === 'large' ? "default" : "outline"} 
                    className="justify-start"
                    onClick={() => setFontSize('large')}
                  >
                    <span className="mr-2 text-base">Aa</span>
                    Large
                    {fontSize === 'large' && <Check className="ml-auto h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="p-6 border rounded-md bg-muted/20">
                <h4 className="text-md font-medium mb-4">Preview</h4>
                <div className="space-y-2">
                  <p className="text-xs">This is small text</p>
                  <p className="text-sm">This is medium text</p>
                  <p className="text-base">This is large text</p>
                </div>
                <p className="mt-4 text-sm font-medium">
                  Current font size: <span className="text-primary">{fontSize}</span>
                </p>
                <p className="mt-1 text-sm font-medium">
                  Current theme: <span className="text-primary">{theme} ({isDarkMode ? 'dark' : 'light'} appearance)</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Manage your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="text-sm font-medium">Business Name</p>
                  <p className="text-xl font-bold">{businessName}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 sm:mt-0"
                  onClick={() => setIsBusinessNameDialogOpen(true)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>Set your preferred currency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Display Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={(value) => setCurrency(value)}
                  >
                    <SelectTrigger id="currency">
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
                
                <div className="p-4 border rounded-md bg-muted/20">
                  <p className="text-sm font-medium mb-1">Preview:</p>
                  <p className="text-lg">{formatCurrency(1234.56)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Date & Display Preferences</CardTitle>
              <CardDescription>Configure how dates and lists appear</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Date Format</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Select
                      value={dateFormat}
                      onValueChange={handleDateFormatChange}
                    >
                      <SelectTrigger id="dateFormat">
                        <SelectValue placeholder="Select Date Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (American)</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (European)</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                        <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY (Long format)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-4 border rounded-md bg-muted/20">
                    <p className="text-sm font-medium mb-1">Today's date:</p>
                    <p className="text-lg">{formatDate(new Date(), dateFormat)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Default View</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant={defaultView === 'dashboard' ? "default" : "outline"} 
                    className="justify-start"
                    onClick={() => handleDefaultViewChange('dashboard')}
                  >
                    <Grid3x3 className="mr-2 h-4 w-4" />
                    Dashboard View
                    {defaultView === 'dashboard' && <Check className="ml-auto h-4 w-4" />}
                  </Button>
                  
                  <Button 
                    variant={defaultView === 'list' ? "default" : "outline"} 
                    className="justify-start"
                    onClick={() => handleDefaultViewChange('list')}
                  >
                    <List className="mr-2 h-4 w-4" />
                    List View
                    {defaultView === 'list' && <Check className="ml-auto h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
              <CardDescription>Help us continue to improve TransactLy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <img 
                    src={supportQRCode} 
                    alt="Support QR Code" 
                    className="w-32 h-32 rounded-md"
                  />
                </div>
                <div className="space-y-3 text-center md:text-left">
                  <p className="text-sm">TransactLy is proudly ad-free and maintained by a small team of developers.</p>
                  <p className="text-sm">If you find this app useful, consider buying us a coffee to support further development!</p>
                  <Button variant="default">
                    <Coffee className="mr-2 h-4 w-4" />
                    Buy Me a Coffee
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Business Name Dialog */}
      <Dialog open={isBusinessNameDialogOpen} onOpenChange={setIsBusinessNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Business Name</DialogTitle>
            <DialogDescription>
              Change the name of your business that appears in the header.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="businessName" className="text-right">
                Name
              </Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="col-span-3"
                placeholder="Enter your business name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBusinessNameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBusinessName}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Settings;
