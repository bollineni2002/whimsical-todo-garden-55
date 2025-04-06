import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class SimpleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by SimpleErrorBoundary:', error, errorInfo);
  }
  
  handleRefresh = (): void => {
    window.location.reload();
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-xl font-bold text-center mb-4">Something went wrong</h1>
            
            <p className="text-gray-700 mb-4">
              We encountered an error while loading the application. This might be due to recent changes or database issues.
            </p>
            
            <div className="p-3 bg-red-50 text-red-700 rounded-md mb-4 text-sm overflow-auto max-h-[200px]">
              <pre className="whitespace-pre-wrap">{error?.toString()}</pre>
            </div>
            
            <Button 
              onClick={this.handleRefresh}
              className="w-full"
            >
              Refresh Page
            </Button>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>If the issue persists, please try:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Clearing your browser cache</li>
                <li>Checking your internet connection</li>
                <li>Logging out and logging back in</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default SimpleErrorBoundary;
