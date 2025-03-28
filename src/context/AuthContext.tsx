import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

// AuthContext type
export type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, phone: string, name: string) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isLoading: boolean; // Alias for loading to maintain compatibility
  sendPasswordResetEmail: (email: string) => Promise<{ error: any }>;
  resetPassword: (password: string) => Promise<{ error: any }>;
  updateProfile: (data: { name?: string, phone?: string }) => Promise<{ error: any }>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<{ error: any }>;
  signInWithPhone: (phone: string) => Promise<{ error: any }>;
  verifyOTP: (phone: string, otp: string) => Promise<{ error: any }>;
  resendOTP: (phone: string) => Promise<{ error: any }>;
};

// Create the context
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Export the context hook
export const useAuth = () => useContext(AuthContext);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error loading auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      });

      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Sign up function with phone
  const signUp = async (email: string, password: string, phone: string, name: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone_number: phone,
            full_name: name,
          },
        },
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      });

      return { error: null, data };
    } catch (error) {
      console.error('Error signing up:', error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error, data: null };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Password reset function
  const sendPasswordResetEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Password reset email sent",
        description: "Check your email for a password reset link.",
      });

      return { error: null };
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        title: "Password reset failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Update password function after reset
  const resetPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        toast({
          title: "Password update failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });

      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Password update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Update profile function
  const updateProfile = async (data: { name?: string, phone?: string }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.name,
          phone_number: data.phone
        }
      });

      if (error) {
        toast({
          title: "Profile update failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Profile update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Update password function - requires old password
  const updatePassword = async (oldPassword: string, newPassword: string) => {
    try {
      // First verify the old password is correct
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: oldPassword,
      });

      if (verifyError) {
        toast({
          title: "Password update failed",
          description: "The current password you entered is incorrect.",
          variant: "destructive",
        });
        return { error: verifyError };
      }

      // Now update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast({
          title: "Password update failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });

      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Password update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Sign in with phone function
  const signInWithPhone = async (phone: string) => {
    try {
      // In a real implementation, you would initiate OTP sending here
      // For now, we'll simulate a successful OTP send
      toast({
        title: "OTP Sent",
        description: `A verification code has been sent to ${phone}`,
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Failed to send OTP",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Verify OTP function
  const verifyOTP = async (phone: string, otp: string) => {
    try {
      // In a real implementation, you would verify the OTP here
      // For now, we'll simulate a successful verification
      // In production, this would involve a call to your auth system
      
      // Simulate verification success
      toast({
        title: "Verification Successful",
        description: "Your phone number has been verified.",
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Failed",
        description: "The OTP you entered is incorrect or has expired.",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Resend OTP function
  const resendOTP = async (phone: string) => {
    try {
      // In a real implementation, you would resend the OTP here
      // For now, we'll simulate a successful resend
      
      toast({
        title: "OTP Resent",
        description: `A new verification code has been sent to ${phone}`,
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast({
        title: "Failed to resend OTP",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        signIn,
        signUp,
        signOut,
        loading,
        isLoading: loading, // Alias for compatibility
        sendPasswordResetEmail,
        resetPassword,
        updateProfile,
        updatePassword,
        signInWithPhone,
        verifyOTP,
        resendOTP
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
