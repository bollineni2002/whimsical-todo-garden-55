
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/languages';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthHeader from '@/components/AuthHeader';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const { verifyOTP, resendOTP, user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  
  useEffect(() => {
    if (user) {
      navigate('/');
      return;
    }
    
    // Get the phone number from session storage
    const savedPhone = sessionStorage.getItem('verifyPhone');
    if (!savedPhone) {
      navigate('/auth');
      return;
    }
    
    setPhone(savedPhone);
    
    // Start the countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate, user]);
  
  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await verifyOTP(phone, otp);
      toast({
        title: "Verification Successful",
        description: "You have been successfully signed in.",
      });
      // Clear session storage
      sessionStorage.removeItem('verifyPhone');
      // Navigate to home
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Could not verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    
    try {
      await resendOTP(phone);
      setCountdown(30);
      
      // Restart the countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your phone.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Resend OTP",
        description: error.message || "Could not resend verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
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
                {t('verify_otp')}
              </CardTitle>
              <CardDescription className="text-center">
                Enter the verification code sent to {phone}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={6} 
                  value={otp} 
                  onChange={setOtp}
                  className="gap-2"
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
              
              <Button 
                onClick={handleVerify} 
                className="w-full" 
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span> Verifying...
                  </span>
                ) : (
                  t('verify_otp')
                )}
              </Button>
              
              <div className="text-center">
                <Button 
                  variant="link" 
                  disabled={countdown > 0 || resendLoading}
                  onClick={handleResendOTP}
                >
                  {countdown > 0 ? (
                    `${t('resend_otp')} (${countdown}s)`
                  ) : resendLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">⏳</span> Sending...
                    </span>
                  ) : (
                    t('resend_otp')
                  )}
                </Button>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 mt-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/auth')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyOTP;
