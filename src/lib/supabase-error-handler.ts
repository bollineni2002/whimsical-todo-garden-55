import { supabaseSimple as supabase } from '@/integrations/supabase/simple-client';

/**
 * Utility to handle and fix common Supabase errors
 */
export const supabaseErrorHandler = {
  /**
   * Check if the Supabase connection is valid and try to fix common issues
   */
  async checkConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Check if we have a valid session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        return {
          success: false,
          message: `Session error: ${sessionError.message}`
        };
      }

      if (!sessionData.session) {
        console.warn('No active session found');
        return {
          success: false,
          message: 'No active session found. Please log in again.'
        };
      }

      // Check if the session is expired
      const expiresAt = sessionData.session.expires_at;
      const now = Math.floor(Date.now() / 1000);

      if (expiresAt && expiresAt < now) {
        console.warn('Session expired, attempting to refresh');

        // Try to refresh the session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError) {
          console.error('Failed to refresh session:', refreshError);
          return {
            success: false,
            message: `Session expired and refresh failed: ${refreshError.message}`
          };
        }

        if (!refreshData.session) {
          console.error('Session refresh did not return a new session');
          return {
            success: false,
            message: 'Session expired and could not be refreshed. Please log in again.'
          };
        }

        console.log('Session refreshed successfully');
      }

      // Test a simple query to verify connection
      const { error: testError } = await supabase.from('profiles').select('id').limit(1);

      if (testError) {
        console.error('Test query error:', testError);

        // Check if it's a permission error
        if (testError.code === 'PGRST301' || testError.message.includes('permission denied')) {
          console.warn('Permission error detected, might be an RLS issue');
          return {
            success: false,
            message: 'Database permission error. This might be due to Row Level Security settings.'
          };
        }

        return {
          success: false,
          message: `Database connection error: ${testError.message}`
        };
      }

      return {
        success: true,
        message: 'Supabase connection is valid'
      };
    } catch (error) {
      console.error('Unexpected error checking Supabase connection:', error);
      return {
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },

  /**
   * Fix common Supabase connection issues
   */
  async fixConnectionIssues(): Promise<{ success: boolean; message: string }> {
    try {
      // First check the connection
      const checkResult = await this.checkConnection();

      if (checkResult.success) {
        return checkResult;
      }

      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error('Failed to refresh session:', refreshError);

        // Try to get the current user
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user) {
          console.error('Failed to get user:', userError);
          return {
            success: false,
            message: 'Authentication issues detected. Please log out and log in again.'
          };
        }
      }

      // Check if we have a valid session after refresh
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        return {
          success: false,
          message: 'Could not establish a valid session. Please log out and log in again.'
        };
      }

      // Test the connection again
      const finalCheck = await this.checkConnection();

      return finalCheck;
    } catch (error) {
      console.error('Error fixing Supabase connection:', error);
      return {
        success: false,
        message: `Error fixing connection: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },

  /**
   * Handle a Supabase error and return a user-friendly message
   */
  getErrorMessage(error: any): string {
    if (!error) {
      return 'Unknown error';
    }

    // Extract the error message
    const errorMessage = error.message || error.error_description || String(error);

    // Check for common error patterns
    if (errorMessage.includes('JWT expired')) {
      return 'Your session has expired. Please log in again.';
    }

    if (errorMessage.includes('permission denied')) {
      return 'You do not have permission to perform this action.';
    }

    if (errorMessage.includes('does not exist')) {
      return 'The requested resource does not exist.';
    }

    if (errorMessage.includes('duplicate key')) {
      return 'This record already exists.';
    }

    if (errorMessage.includes('network error')) {
      return 'Network error. Please check your internet connection.';
    }

    // Return the original error message if no pattern matches
    return errorMessage;
  }
};

// Add a global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);

  // Check if it's a Supabase error
  if (event.reason &&
      (event.reason.error_description ||
       (event.reason.message && event.reason.message.includes('supabase')))) {
    console.error('Supabase error detected:', supabaseErrorHandler.getErrorMessage(event.reason));
  }
});
