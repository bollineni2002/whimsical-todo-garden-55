
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/lib/languages';
import AuthHeader from '@/components/AuthHeader';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Check if we have the hash parameter in the URL (from the reset link)
  useEffect(() => {
    if (!location.hash) {
      toast({
        title: "Invalid Reset Link",
        description: "Please use the link provided in your email.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [location, navigate, toast]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    setValidationError('');
    setIsResetting(true);
    
    try {
      const { error } = await resetPassword(password);
      
      if (error) {
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsResetting(false);
        return;
      }
      
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully. You can now sign in with your new password.",
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (error) {
      console.error('Error in password reset:', error);
      toast({
        title: "An Error Occurred",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AuthHeader 
        businessName="TransactLy" 
        onEditName={() => {}}
      />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t('reset_password')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t('new_password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  required
                />
              </div>
              
              {validationError && (
                <div className="text-destructive text-sm">{validationError}</div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isResetting}
              >
                {isResetting ? "Resetting..." : t('reset_password')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="link" 
              className="text-sm text-muted-foreground"
              onClick={() => navigate('/auth')}
            >
              Back to sign in
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default ResetPassword;
