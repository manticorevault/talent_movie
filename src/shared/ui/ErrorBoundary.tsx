import { Component, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // We could log error metrics to a third-party service here
    console.error('Uncaught error:', error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-xl">
            <CircleAlert className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p className="text-sm">
                The application encountered an unexpected error. Please try reloading the page.
              </p>
              {this.state.error && (
                <pre className="rounded-md bg-destructive/10 p-4 text-xs overflow-auto max-h-48">
                  {this.state.error.message}
                </pre>
              )}
              <Button
                variant="outline"
                className="w-full bg-background mt-4"
                onClick={() => window.location.reload()}
              >
                Reload page
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
