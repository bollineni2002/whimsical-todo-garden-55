
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import { Lock, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetComplete, setResetComplete] = useState(false);
  
  const { updatePassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password should be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updatePassword(password);
      setResetComplete(true);
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      });
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message || "Could not update password. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-background"
    >
      <div className="absolute top-4 right-4">
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
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Create a new password for your account
            </CardDescription>
          </CardHeader>
          
          {resetComplete ? (
            <CardContent className="space-y-4">
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  Your password has been successfully reset. You will be redirected to login shortly.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={() => navigate('/auth')}
                  variant="outline"
                >
                  Return to login
                </Button>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="New password" 
                      required 
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="Confirm new password" 
                      required 
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Reset Password'}
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => navigate('/auth')}
                  type="button"
                >
                  Cancel
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default ResetPassword;
