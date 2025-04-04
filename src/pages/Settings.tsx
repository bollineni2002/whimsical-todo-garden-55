import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage, languages, LanguageCode } from '@/lib/languages';
import { useCurrency } from '@/context/CurrencyContext';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  User, 
  Lock, 
  Languages, 
  Palette, 
  SlidersHorizontal, 
  ChevronLeft, 
  CreditCard,
  Pencil,
  Calendar,
  LayoutGrid,
  Save,
  Moon,
  Sun,
  Monitor,
  TextQuote,
  Coffee,
  Settings2,
  Globe,
  HelpCircle
} from 'lucide-react';
import SettingsHeader from '@/components/settings/SettingsHeader';
import ProfileSettings from '@/components/settings/ProfileSettings';

const profileSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required." }),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const businessNameSchema = z.object({
  businessName: z.string().min(1, { message: "Business name is required." }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type BusinessNameFormValues = z.infer<typeof businessNameSchema>;

const dateFormats = [
  { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '04/04/2025' },
  { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '04/04/2025' },
  { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2025-04-04' },
  { id: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY', example: '04-Apr-2025' },
];

const currencyOptions = [
  { id: 'USD', label: 'USD', symbol: '$' },
  { id: 'EUR', label: 'EUR', symbol: '€' },
  { id: 'GBP', label: 'GBP', symbol: '£' },
  { id: 'JPY', label: 'JPY', symbol: '¥' },
  { id: 'INR', label: 'INR', symbol: '₹' },
];

const viewOptions = [
  { id: 'grid', label: 'Grid View', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'list', label: 'List View', icon: <TextQuote className="h-4 w-4" /> },
];

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateProfile, updatePassword } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  
  const [isBusinessNameDialogOpen, setIsBusinessNameDialogOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [businessName, setBusinessName] = useState('TransactLy');
  const [selectedDateFormat, setSelectedDateFormat] = useState('MM/DD/YYYY');
  const [selectedView, setSelectedView] = useState('grid');
  const [fontSize, setFontSize] = useState('medium');

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phoneNumber: user?.user_metadata?.phone || '',
    }
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const businessNameForm = useForm<BusinessNameFormValues>({
    resolver: zodResolver(businessNameSchema),
    defaultValues: {
      businessName: businessName,
    }
  });

  useState(() => {
    const savedBusinessName = localStorage.getItem('businessName');
    if (savedBusinessName) {
      setBusinessName(savedBusinessName);
      businessNameForm.setValue('businessName', savedBusinessName);
    }

    const savedDateFormat = localStorage.getItem('dateFormat');
    if (savedDateFormat) {
      setSelectedDateFormat(savedDateFormat);
    }

    const savedView = localStorage.getItem('defaultView');
    if (savedView) {
      setSelectedView(savedView);
    }

    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      setFontSize(savedFontSize);
      document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
      document.documentElement.classList.add(
        savedFontSize === 'small' ? 'text-sm' : 
        savedFontSize === 'large' ? 'text-lg' : 
        'text-base'
      );
    }
  }, []);

  const handleProfileUpdate = async (data: ProfileFormValues) => {
    setIsUpdatingProfile(true);
    try {
      await updateProfile({
        name: data.fullName,
        phone: data.phoneNumber,
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (data: PasswordFormValues) => {
    try {
      setIsUpdatingPassword(true);
      await updatePassword(data.newPassword);
      passwordForm.reset();
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully."
      });
    } catch (error) {
      console.error("Failed to update password:", error);
      toast({
        title: "Password Update Failed",
        description: "Could not update your password. Please check your current password and try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleBusinessNameUpdate = async (data: BusinessNameFormValues) => {
    try {
      setBusinessName(data.businessName);
      localStorage.setItem('businessName', data.businessName);
      setIsBusinessNameDialogOpen(false);
      toast({
        title: "Business Name Updated",
        description: "Your business name has been updated successfully."
      });
    } catch (error) {
      console.error("Failed to update business name:", error);
      toast({
        title: "Update Failed",
        description: "Could not update business name. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDateFormatChange = (format: string) => {
    setSelectedDateFormat(format);
    localStorage.setItem('dateFormat', format);
    toast({
      title: "Date Format Updated",
      description: "Your preferred date format has been saved."
    });
  };

  const handleDefaultViewChange = (view: string) => {
    setSelectedView(view);
    localStorage.setItem('defaultView', view);
    toast({
      title: "Default View Updated",
      description: "Your preferred view has been saved."
    });
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    document.documentElement.classList.add(
      size === 'small' ? 'text-sm' : 
      size === 'large' ? 'text-lg' : 
      'text-base'
    );
    
    toast({
      title: "Font Size Updated",
      description: "Your preferred font size has been applied."
    });
  };

  const formatDate = (date: Date, format: string) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const monthName = date.toLocaleString('default', { month: 'short' });
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
        return `${month}/${day}/${year}`;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 md:py-8 md:px-6 space-y-6 max-w-5xl">
      <SettingsHeader 
        title="Account Settings" 
        description="Manage your account settings and preferences." 
      />

      <Tabs defaultValue="profile" className="w-full">
        <div className="overflow-x-auto pb-2 mb-2 scrollbar-hide">
          <TabsList className="h-auto p-1 flex-nowrap w-auto inline-flex justify-start border-b dark:border-gray-800 w-full">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-accent rounded-md px-3 py-2 text-sm"
            >
              <User className="w-4 h-4 mr-2" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="password" 
              className="data-[state=active]:bg-accent rounded-md px-3 py-2 text-sm"
            >
              <Lock className="w-4 h-4 mr-2" />
              <span>Password</span>
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className="data-[state=active]:bg-accent rounded-md px-3 py-2 text-sm"
            >
              <Settings2 className="w-4 h-4 mr-2" />
              <span>Preferences</span>
            </TabsTrigger>
            <TabsTrigger 
              value="language" 
              className="data-[state=active]:bg-accent rounded-md px-3 py-2 text-sm"
            >
              <Globe className="w-4 h-4 mr-2" />
              <span>Language</span>
            </TabsTrigger>
            <TabsTrigger 
              value="help" 
              className="data-[state=active]:bg-accent rounded-md px-3 py-2 text-sm"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              <span>Help</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-6 animate-in slide-in-from-left-4">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="password" className="space-y-6 animate-in slide-in-from-left-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your security credentials.</CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Enter your current password" />
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
                          <Input {...field} type="password" placeholder="Enter your new password" />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 8 characters and include uppercase, lowercase, and number.
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
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Confirm your new password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? (
                      <>
                        <Lock className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-6 animate-in slide-in-from-left-4">
          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
              <CardDescription>Choose your preferred language for the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Select Language</Label>
                <Select
                  value={language}
                  onValueChange={(value: LanguageCode) => {
                    setLanguage(value);
                    toast({
                      title: "Language Updated",
                      description: "Your language preference has been updated successfully."
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Available Languages</SelectLabel>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.nativeName} ({lang.name})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  Changes will apply immediately to the entire application.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6 animate-in slide-in-from-left-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Manage your business details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Business Name</Label>
                  <p className="text-lg font-medium mt-1">{businessName}</p>
                </div>
                <Dialog open={isBusinessNameDialogOpen} onOpenChange={setIsBusinessNameDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Business Name</DialogTitle>
                      <DialogDescription>
                        Change the name of your business that appears throughout the application.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...businessNameForm}>
                      <form onSubmit={businessNameForm.handleSubmit(handleBusinessNameUpdate)}>
                        <div className="space-y-4 py-4">
                          <FormField
                            control={businessNameForm.control}
                            name="businessName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter your business name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" type="button" onClick={() => setIsBusinessNameDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>Select your preferred currency for monetary values.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currencyOptions.map((option) => (
                  <Card 
                    key={option.id}
                    className={`cursor-pointer hover:border-primary ${
                      currency === option.id ? 'border-2 border-primary' : 'border'
                    }`}
                    onClick={() => {
                      setCurrency(option.id);
                      toast({
                        title: "Currency Updated",
                        description: `Currency has been changed to ${option.label}.`
                      });
                    }}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">Symbol: {option.symbol}</p>
                      </div>
                      <div className="text-2xl font-semibold">{option.symbol}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Date Format</CardTitle>
              <CardDescription>Choose how dates should be displayed throughout the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <RadioGroup value={selectedDateFormat} onValueChange={handleDateFormatChange}>
                  {dateFormats.map((format) => (
                    <div key={format.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={format.id} id={`format-${format.id}`} />
                      <Label htmlFor={`format-${format.id}`}>
                        {format.label} <span className="text-muted-foreground">({format.example})</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                <div className="mt-4 p-4 bg-accent/20 rounded-md">
                  <p className="text-sm font-medium">Preview</p>
                  <p className="mt-1">Today: {formatDate(new Date(), selectedDateFormat)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default View</CardTitle>
              <CardDescription>Select how you'd like to view content by default.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewOptions.map((option) => (
                  <Card 
                    key={option.id}
                    className={`cursor-pointer hover:border-primary ${
                      selectedView === option.id ? 'border-2 border-primary' : 'border'
                    }`}
                    onClick={() => handleDefaultViewChange(option.id)}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <div className="h-12 w-12 flex items-center justify-center mb-2">
                        {option.icon}
                      </div>
                      <p className="font-medium">{option.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Coffee className="h-5 w-5 mr-2" />
            Support TransactLy
          </CardTitle>
          <CardDescription>
            Help us keep this app ad-free and continuously improving.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center md:flex-row md:items-start gap-8">
          <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-sm text-muted-foreground">QR Code for Support</span>
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-medium">Buy Me a Coffee</h3>
            <p className="text-muted-foreground">
              TransactLy is developed and maintained by a small team passionate about creating useful tools for professionals.
              Your support helps us keep the app ad-free and allows us to add new features regularly.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">
                <Coffee className="h-4 w-4 mr-2" />
                Buy Me a Coffee
              </Button>
              <Button variant="outline">
                Share TransactLy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
