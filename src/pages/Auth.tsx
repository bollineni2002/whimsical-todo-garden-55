
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { Mail, Phone, PhoneCall, Eye, EyeOff, ArrowRight } from 'lucide-react'; // Added Phone icon
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
  // Sign-in state
  const [signInIdentifier, setSignInIdentifier] = useState("");
  const [signInIdentifierType, setSignInIdentifierType] = useState<"email" | "phone" | null>(null);
  // Sign-up state
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPhoneNumber, setSignUpPhoneNumber] = useState("");
  // Common state
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Determine sign-in identifier type whenever it changes
  useEffect(() => {
    if (isValidEmail(signInIdentifier)) {
      setSignInIdentifierType("email");
    } else if (isValidPhone(signInIdentifier)) {
      setSignInIdentifierType("phone");
    } else {
      setSignInIdentifierType(null);
    }
  }, [signInIdentifier]);

  // Reset fields when switching tabs
  useEffect(() => {
    // Reset common fields
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setLoading(false);

    // Reset specific fields based on the new tab
    if (activeTab === 'signin') {
      setName("");
      setSignUpEmail("");
      setSignUpPhoneNumber("");
    } else { // signup tab
      setSignInIdentifier("");
      setSignInIdentifierType(null);
    }
  }, [activeTab]);

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
      if (!signInIdentifier) {
        throw new Error("Please enter an email or phone number");
      }

      if (signInIdentifierType === "email") {
        if (!password) {
          throw new Error("Please enter your password");
        }
        await signIn(signInIdentifier, password);
        // Navigate on success happens automatically via the auth effect
      } else if (signInIdentifierType === "phone") {
        await signInWithPhone(signInIdentifier);
        // Store phone number for OTP verification
        sessionStorage.setItem("verifyPhone", signInIdentifier);
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
      // Validation
      if (!name) throw new Error("Please enter your name");
      if (!signUpEmail) throw new Error("Please enter your email address");
      if (!isValidEmail(signUpEmail)) throw new Error("Please enter a valid email address");
      if (!signUpPhoneNumber) throw new Error("Please enter your phone number");
      if (!isValidPhone(signUpPhoneNumber)) throw new Error("Please enter a valid phone number (e.g., +1234567890)");
      if (!password) throw new Error("Please enter a password");
      if (password.length < 6) throw new Error("Password must be at least 6 characters");
      if (password !== confirmPassword) throw new Error("Passwords do not match");

      // Call signUp context function with email, password, name, and phone
      await signUp(signUpEmail, password, name, signUpPhoneNumber);

      // Reset sign-up fields and switch to sign-in tab on success
      setName("");
      setSignUpEmail("");
      setSignUpPhoneNumber("");
      setPassword("");
      setConfirmPassword("");
      setActiveTab("signin");

      toast({
        title: "Account Created",
        description: "Your account has been created successfully. Please check your email for verification and then sign in.",
      });

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
    // Use signInIdentifier for forgot password check
    if (!signInIdentifier || !isValidEmail(signInIdentifier)) {
      toast({
        title: "Valid Email Required",
        description: "Please enter the email address associated with your account to reset your password.",
        variant: "destructive",
      });
      return;
    }

    navigate("/reset-password", { state: { email: signInIdentifier } });
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
                      <Label htmlFor="signin-identifier">Email or Phone Number</Label>
                      <div className="relative">
                        <Input
                          id="signin-identifier" // Changed ID
                          type="text"
                          placeholder="Enter email or phone number"
                          value={signInIdentifier} // Use signInIdentifier state
                          onChange={(e) => setSignInIdentifier(e.target.value)} // Update signInIdentifier state
                          className="pl-10"
                          required
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {/* Use signInIdentifierType for icon */}
                          {signInIdentifierType === "email" ? (
                            <Mail size={16} />
                          ) : signInIdentifierType === "phone" ? (
                            <PhoneCall size={16} />
                          ) : (
                            <Mail size={16} /> // Default icon
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Show password field only if identifier is an email */}
                    {signInIdentifierType === "email" && (
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
                          {/* Button text depends on identifier type */}
                          {signInIdentifierType === "phone" ? "Continue with OTP" : t('sign_in')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* === Sign Up Form === */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">{t('name')}</Label>
                      <Input
                        id="signup-name" // Changed ID
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={signUpEmail} // Use signUpEmail state
                          onChange={(e) => setSignUpEmail(e.target.value)} // Update signUpEmail state
                          className="pl-10"
                          required
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      </div>
                    </div>

                    {/* Phone Number Field */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <div className="relative">
                        <Input
                          id="signup-phone"
                          type="tel" // Use type="tel" for phone numbers
                          placeholder="Enter your phone number (e.g., +1234567890)"
                          value={signUpPhoneNumber} // Use signUpPhoneNumber state
                          onChange={(e) => setSignUpPhoneNumber(e.target.value)} // Update signUpPhoneNumber state
                          className="pl-10"
                          required
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      </div>
                    </div>

                    {/* Password Fields (always shown for sign-up) */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t('password')}</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password (min. 6 characters)"
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
              {/* Demo Login Section */}
              {activeTab === "signin" && (
                <div className="w-full border border-dashed border-primary/50 rounded-md p-3 mb-2 bg-primary/5">
                  <h3 className="text-sm font-medium text-center mb-2">Demo Login Credentials</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="flex items-center">
                      <span className="font-semibold mr-1">Email:</span>
                      <code className="bg-background px-1 py-0.5 rounded">admin@gmail.com</code>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold mr-1">Password:</span>
                      <code className="bg-background px-1 py-0.5 rounded">123456</code>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setSignInIdentifier("admin@gmail.com");
                      setPassword("123456");
                    }}
                  >
                    Use Demo Credentials
                  </Button>
                </div>
              )}

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
