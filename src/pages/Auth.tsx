
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { At, PhoneCall, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/languages';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import AuthHeader from '@/components/AuthHeader';

// Helper function to validate email format
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Helper function to validate phone number format
const isValidPhone = (phone: string) => {
  return /^\+?[0-9]{10,15}$/.test(phone);
};

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithPhone } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // State for form fields
  const [activeTab, setActiveTab] = useState<string>("signin");
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState<"email" | "phone" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Determine identifier type whenever it changes
  useEffect(() => {
    if (isValidEmail(identifier)) {
      setIdentifierType("email");
    } else if (isValidPhone(identifier)) {
      setIdentifierType("phone");
    } else {
      setIdentifierType(null);
    }
  }, [identifier]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!identifier) {
        throw new Error("Please enter an email or phone number");
      }
      
      if (identifierType === "email") {
        if (!password) {
          throw new Error("Please enter your password");
        }
        await signIn(identifier, password);
        // Navigate on success happens automatically via the auth effect
      } else if (identifierType === "phone") {
        await signInWithPhone(identifier);
        // Store phone number for OTP verification
        sessionStorage.setItem("verifyPhone", identifier);
        navigate("/verify-otp");
      } else {
        throw new Error("Please enter a valid email or phone number");
      }
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!name) {
        throw new Error("Please enter your name");
      }
      
      if (!identifier) {
        throw new Error("Please enter an email and phone number");
      }
      
      if (!identifierType) {
        throw new Error("Please enter a valid email or phone number");
      }
      
      if (identifierType === "email") {
        if (!password) {
          throw new Error("Please enter a password");
        }
        
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        
        await signUp(identifier, password, name);
        setActiveTab("signin");
        toast({
          title: "Account Created",
          description: "Your account has been created successfully. Please sign in.",
        });
      } else if (identifierType === "phone") {
        // For phone signup, we'll need to collect an email as well
        toast({
          title: "Email Required",
          description: "Please provide an email address for account creation.",
          variant: "destructive",
        });
        return;
      }
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgotPassword = () => {
    if (!identifier || identifierType !== "email") {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address to reset your password.",
        variant: "destructive",
      });
      return;
    }
    
    navigate("/reset-password", { state: { email: identifier } });
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthHeader businessName="TransactLy" />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                {activeTab === "signin" ? t('sign_in') : t('sign_up')}
              </CardTitle>
              <CardDescription className="text-center">
                {activeTab === "signin" 
                  ? "Enter your email/phone to sign in to your account"
                  : "Create a new account to get started"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">{t('sign_in')}</TabsTrigger>
                  <TabsTrigger value="signup">{t('sign_up')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="identifier">Email or Phone Number</Label>
                      <div className="relative">
                        <Input
                          id="identifier"
                          type="text"
                          placeholder="Enter email or phone number"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          className="pl-10"
                          required
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {identifierType === "email" ? (
                            <At size={16} />
                          ) : identifierType === "phone" ? (
                            <PhoneCall size={16} />
                          ) : (
                            <At size={16} />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {identifierType === "email" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="signin-password">{t('password')}</Label>
                          <Button 
                            type="button" 
                            variant="link" 
                            className="px-0 text-xs" 
                            onClick={handleForgotPassword}
                          >
                            {t('forgot_password')}
                          </Button>
                        </div>
                        <div className="relative">
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">⏳</span> Processing...
                        </span>
                      ) : (
                        <>
                          {identifierType === "phone" ? "Continue with OTP" : t('sign_in')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('name')}</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-identifier">Email or Phone Number</Label>
                      <div className="relative">
                        <Input
                          id="signup-identifier"
                          type="text"
                          placeholder="Enter email or phone number"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          className="pl-10"
                          required
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {identifierType === "email" ? (
                            <At size={16} />
                          ) : identifierType === "phone" ? (
                            <PhoneCall size={16} />
                          ) : (
                            <At size={16} />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {identifierType === "email" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">{t('password')}</Label>
                          <div className="relative">
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pr-10"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">{t('confirm_password')}</Label>
                          <Input
                            id="confirm-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </>
                    )}
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">⏳</span> Processing...
                        </span>
                      ) : (
                        <>
                          {t('sign_up')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 mt-4">
              <div className="text-sm text-center text-muted-foreground w-full">
                {activeTab === "signin" ? (
                  <span>
                    {t('dont_have_account')}{' '}
                    <Button 
                      variant="link" 
                      className="p-0" 
                      onClick={() => setActiveTab("signup")}
                    >
                      {t('sign_up')}
                    </Button>
                  </span>
                ) : (
                  <span>
                    {t('already_have_account')}{' '}
                    <Button 
                      variant="link" 
                      className="p-0" 
                      onClick={() => setActiveTab("signin")}
                    >
                      {t('sign_in')}
                    </Button>
                  </span>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
