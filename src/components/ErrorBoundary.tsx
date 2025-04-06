import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { supabaseErrorHandler } from '@/lib/supabase-error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isFixing: boolean;
  fixResult: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isFixing: false,
      fixResult: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
      isFixing: false,
      fixResult: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Check if it's a Supabase error
    if (error.message.includes('supabase') || 
        error.message.includes('auth') || 
        error.message.includes('database')) {
      console.log('Supabase-related error detected');
    }
  }
  
  handleTryAgain = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      fixResult: null
    });
  }
  
  handleFixIssues = async (): Promise<void> => {
    this.setState({ isFixing: true });
    
    try {
      // Try to fix Supabase connection issues
      const result = await supabaseErrorHandler.fixConnectionIssues();
      
      this.setState({
        isFixing: false,
        fixResult: result.message
      });
      
      if (result.success) {
        // Wait a moment before resetting the error state
        setTimeout(() => {
          this.handleTryAgain();
        }, 1500);
      }
    } catch (error) {
      console.error('Error fixing issues:', error);
      this.setState({
        isFixing: false,
        fixResult: `Failed to fix issues: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }

  render(): ReactNode {
    const { hasError, error, errorInfo, isFixing, fixResult } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }
      
      // Otherwise, use the default error UI
      return (
        <div className="flex items-center justify-center min-h-[300px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <CardTitle className="text-red-600 dark:text-red-400">Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Error details:</p>
                <div className="bg-muted p-2 rounded-md overflow-auto max-h-[200px]">
                  <pre className="text-xs whitespace-pre-wrap">
                    {error?.toString()}
                  </pre>
                </div>
                
                {errorInfo && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Component stack:</p>
                    <div className="bg-muted p-2 rounded-md overflow-auto max-h-[200px]">
                      <pre className="text-xs whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                )}
                
                {fixResult && (
                  <div className={`mt-2 p-2 rounded-md ${fixResult.includes('success') ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                    <p className="text-xs">{fixResult}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button 
                variant="outline" 
                onClick={this.handleTryAgain}
                disabled={isFixing}
              >
                Try again
              </Button>
              
              <Button 
                onClick={this.handleFixIssues}
                disabled={isFixing}
              >
                {isFixing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Fixing...
                  </>
                ) : (
                  'Fix Issues'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    // If there's no error, render the children
    return children;
  }
}

export default ErrorBoundary;
