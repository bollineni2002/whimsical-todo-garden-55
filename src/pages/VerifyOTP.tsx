
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Globe } from 'lucide-react';
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from '@/components/ui/input-otp';
import { useLanguage, languages } from '@/lib/languages';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserPreferences } from '@/context/UserPreferencesContext';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  
  const { verifyOTP, resendOTP, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const { updatePreferences } = useUserPreferences();
  
  // Get phone number from location state
  const phone = location.state?.phone || '';
  
  useEffect(() => {
    if (!phone) {
      // Redirect if no phone number is provided
      navigate('/auth');
      toast({
        title: "Error",
        description: "No phone number provided for verification",
        variant: "destructive",
      });
    }
  }, [phone, navigate, toast]);
  
  useEffect(() => {
    let timer: number;
    if (resendDisabled) {
      timer = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      clearInterval(timer);
    };
  }, [resendDisabled]);
  
  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await verifyOTP(phone, otp);
      toast({
        title: "Success",
        description: "Phone number verified successfully",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Could not verify OTP. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleResend = async () => {
    try {
      await resendOTP(phone);
      setResendDisabled(true);
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your phone",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend OTP",
        description: error.message || "Could not resend OTP. Please try again.",
        variant: "destructive",
      });
    }
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
            <CardTitle>{t('verify_otp')}</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to {phone}. 
              Enter the code below to verify your phone number.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex justify-center my-8">
              <InputOTP 
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              onClick={handleVerify} 
              className="w-full" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? 'Verifying...' : t('verify_otp')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <div className="flex justify-center w-full">
              <Button 
                variant="link" 
                onClick={handleResend}
                disabled={resendDisabled}
              >
                {resendDisabled 
                  ? `${t('resend_otp')} in ${countdown}s` 
                  : `${t('resend_otp')}`}
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              {t('already_have_account')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
};

export default VerifyOTP;
