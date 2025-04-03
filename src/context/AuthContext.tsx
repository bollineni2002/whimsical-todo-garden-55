
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  // Allow updating name, phone, or business_name in metadata
  updateProfile: (profile: { name?: string; phone?: string; business_name?: string; email?: string }) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, token: string) => Promise<void>;
  resendOTP: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user || null);
          }
        );
        
        // Then check for existing session
        const { data: { session: activeSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error retrieving session:', error);
        } else {
          setSession(activeSession);
          setUser(activeSession?.user || null);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Could not sign in. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string, phone?: string) => {
    try {
      setIsLoading(true);
      
      // Create default options
      const options: any = {
        email,
        password,
        options: {
          data: {
            full_name: name || '',
            phone: phone || '',
          },
        },
      };
      
      const { error } = await supabase.auth.signUp(options);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account.",
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign up failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: error.message || "Could not sign out. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      // Get the current window URL (deployment URL)
      const deploymentUrl = window.location.origin;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${deploymentUrl}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for a password reset link.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Password reset failed",
        description: error.message || "Could not send reset email. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: "Password update failed",
        description: error.message || "Could not update password. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Updated to handle business_name as well
  const updateProfile = async (profile: { name?: string; phone?: string; business_name?: string; email?: string }) => {
    try {
      setIsLoading(true);

      const updates: any = {};
      const metadataUpdates: any = {};

      // Prepare metadata updates
      if (profile.name) metadataUpdates.full_name = profile.name;
      if (profile.phone) metadataUpdates.phone = profile.phone;
      if (profile.business_name) metadataUpdates.business_name = profile.business_name;

      if (Object.keys(metadataUpdates).length > 0) {
        // Merge with existing metadata to avoid overwriting unrelated fields
        const currentMetadata = user?.user_metadata || {};
        updates.data = { ...currentMetadata, ...metadataUpdates };
      }

      // Update email if provided (handle with caution - requires verification flow usually)
      if (profile.email) {
        updates.email = profile.email;
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates);
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Profile update failed",
        description: error.message || "Could not update profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithPhone = async (phone: string) => {
    try {
      setIsLoading(true);
      
      // This is a placeholder as Supabase currently doesn't support OTP directly
      // In a production app, integrate with Twilio to send OTP
      // For now, we'll just mock this functionality
      
      // Mock successful OTP sent
      setTimeout(() => {
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your phone.",
        });
      }, 1000);
      
      return Promise.resolve();
      
    } catch (error: any) {
      console.error('Phone sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Could not send verification code. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (phone: string, token: string) => {
    try {
      setIsLoading(true);
      
      // This is a placeholder as Supabase currently doesn't support OTP directly
      // In a production app, verify with Twilio API
      // For demo purposes, we'll mock verification with any 6-digit code
      
      if (token.length === 6) {
        // Mock successful verification
        // In a real implementation, you would verify with your SMS provider (Twilio)
        
        // After verification, you'd sign in the user
        // For now, we'll use a placeholder email based on phone number to simulate login
        const placeholderEmail = `${phone.replace(/\D/g, '')}@example.com`;
        const placeholderPassword = 'phone-auth-password';
        
        // You would need to have created this user in advance or implement phone-based auth
        // This is just a mock for demonstration purposes
        await signIn(placeholderEmail, placeholderPassword);
        
        return Promise.resolve();
      } else {
        throw new Error("Invalid verification code");
      }
      
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification failed",
        description: error.message || "Could not verify code. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async (phone: string) => {
    try {
      setIsLoading(true);
      
      // Mock resending OTP
      // In a real implementation, you would call your SMS provider API (Twilio)
      setTimeout(() => {
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your phone.",
        });
      }, 1000);
      
      return Promise.resolve();
      
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      toast({
        title: "Failed to resend code",
        description: error.message || "Could not resend verification code. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signIn, 
      signUp, 
      signOut, 
      resetPassword,
      updatePassword,
      updateProfile,
      signInWithPhone,
      verifyOTP,
      resendOTP
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
