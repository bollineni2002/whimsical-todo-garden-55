
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, User, Lock, ArrowRight, Globe, Eye, EyeOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage, languages } from '@/lib/languages';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserPreferences } from '@/context/UserPreferencesContext';

const Auth = () => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { signIn, signUp, resetPassword, signInWithPhone, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const { updatePreferences } = useUserPreferences();

  useEffect(() => {
    // Reset form when switching between login/signup
    setPassword('');
    setConfirmPassword('');
  }, [isLogin]);

  useEffect(() => {
    // Reset form fields when switching auth methods
    setPassword('');
  }, [authMethod]);

  const validateForm = () => {
    // Validate email format
    if (authMethod === 'email' || (!isLogin && email)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return false;
      }
    }
    
    // Validate phone format (simple validation)
    if (authMethod === 'phone' || (!isLogin && phone)) {
      const phoneRegex = /^\+?\d{10,15}$/;
      if (!phoneRegex.test(phone)) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid phone number.",
          variant: "destructive",
        });
        return false;
      }
    }
    
    // In signup mode, both email and phone are required
    if (!isLogin) {
      if (!email) {
        toast({
          title: "Email required",
          description: "Please enter your email address.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!phone) {
        toast({
          title: "Phone required",
          description: "Please enter your phone number.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!name) {
        toast({
          title: "Name required",
          description: "Please enter your full name.",
          variant: "destructive",
        });
        return false;
      }
    }
    
    // For signup, check password strength and confirmation
    if (!isLogin || authMethod === 'email') {
      if (password.length < 6) {
        toast({
          title: "Password too short",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!isLogin && password !== confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure your passwords match.",
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isForgotPassword) {
      try {
        await resetPassword(email);
        toast({
          title: "Reset email sent",
          description: "Check your email for password reset instructions.",
        });
      } catch (error: any) {
        toast({
          title: "Reset failed",
          description: error.message || "Could not send reset email.",
          variant: "destructive",
        });
      }
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isLogin) {
        if (authMethod === 'email') {
          await signIn(email, password);
          navigate('/');
        } else {
          // Navigate to OTP verification
          await signInWithPhone(phone);
          navigate('/verify-otp', { state: { phone } });
        }
      } else {
        // Sign up - both email and phone are required
        await signUp(email, password, name, phone);
        // If using phone, go to verification
        if (authMethod === 'phone') {
          navigate('/verify-otp', { state: { phone } });
        } else {
          toast({
            title: "Account created",
            description: "Your account has been created successfully.",
          });
          navigate('/');
        }
      }
    } catch (error: any) {
      toast({
        title: isLogin ? "Login failed" : "Signup failed",
        description: error.message || "Authentication error",
        variant: "destructive",
      });
    }
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
  };
  
  const handleLanguageChange = (value: string) => {
    const newLang = value as any;
    setLanguage(newLang);
    updatePreferences({ language: newLang });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-background"
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[140px]">
            <Globe className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.nativeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-primary-foreground" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
              <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
            </svg>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {isForgotPassword 
                ? t('reset_password')
                : isLogin ? t('sign_in') : t('sign_up')}
            </CardTitle>
            <CardDescription>
              {isForgotPassword 
                ? 'Enter your email to receive a password reset link' 
                : isLogin 
                  ? 'Enter your credentials to access your account' 
                  : 'Sign up for a new account to manage your transactions'}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            {!isForgotPassword && (
              <CardContent className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('name')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="John Doe" 
                        required 
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}
                
                <Tabs defaultValue={authMethod} onValueChange={(value) => setAuthMethod(value as 'email' | 'phone')}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="email">{t('email')}</TabsTrigger>
                    <TabsTrigger value="phone">{t('phone')}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="email" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="your@email.com" 
                          required 
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">{t('password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          placeholder="********" 
                          required 
                          className="pl-10 pr-10"
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-3 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {!isLogin && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="confirmPassword" 
                              type={showPassword ? "text" : "password"} 
                              value={confirmPassword} 
                              onChange={(e) => setConfirmPassword(e.target.value)} 
                              placeholder="********" 
                              required 
                              className="pl-10 pr-10"
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-3 text-muted-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* In signup mode, always require phone regardless of tab */}
                        <div className="space-y-2">
                          <Label htmlFor="phone-signup">{t('phone')}</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="phone-signup" 
                              type="tel" 
                              value={phone} 
                              onChange={(e) => setPhone(e.target.value)} 
                              placeholder="+1234567890" 
                              required 
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="phone" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('phone')}</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="phone" 
                          type="tel" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          placeholder="+1234567890" 
                          required 
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    {!isLogin && (
                      <>
                        {/* In signup mode, always require email regardless of tab */}
                        <div className="space-y-2">
                          <Label htmlFor="email-signup">{t('email')}</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="email-signup" 
                              type="email" 
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)} 
                              placeholder="your@email.com" 
                              required
                              className="pl-10"
                            />
                          </div>
                        </div>
                      
                        <div className="space-y-2">
                          <Label htmlFor="password-phone">{t('password')}</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="password-phone" 
                              type={showPassword ? "text" : "password"} 
                              value={password} 
                              onChange={(e) => setPassword(e.target.value)} 
                              placeholder="********" 
                              required 
                              className="pl-10 pr-10"
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-3 text-muted-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword-phone">{t('confirm_password')}</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="confirmPassword-phone" 
                              type={showPassword ? "text" : "password"} 
                              value={confirmPassword} 
                              onChange={(e) => setConfirmPassword(e.target.value)} 
                              placeholder="********" 
                              required 
                              className="pl-10 pr-10"
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-3 text-muted-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
            
            {isForgotPassword && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">{t('email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="reset-email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="your@email.com" 
                      required 
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            )}
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading 
                  ? 'Processing...' 
                  : isForgotPassword 
                    ? t('reset_password')
                    : isLogin
                      ? (authMethod === 'email' ? t('sign_in') : t('send_otp'))
                      : t('sign_up')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              {!isForgotPassword && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin 
                    ? t('dont_have_account')
                    : t('already_have_account')}
                </Button>
              )}
              
              {(isLogin && !isForgotPassword && authMethod === 'email') && (
                <Button 
                  type="button" 
                  variant="link" 
                  className="w-full"
                  onClick={toggleForgotPassword}
                >
                  {t('forgot_password')}
                </Button>
              )}
              
              {isForgotPassword && (
                <Button 
                  type="button" 
                  variant="link" 
                  className="w-full"
                  onClick={toggleForgotPassword}
                >
                  {t('already_have_account')}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </motion.div>
  );
};

export default Auth;
