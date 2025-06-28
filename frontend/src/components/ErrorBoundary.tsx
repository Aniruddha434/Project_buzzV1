import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode; // Optional fallback UI
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);

    // Check if it's a dynamic import error
    if (error.message.includes('Failed to fetch dynamically imported module')) {
      console.log('🔄 Dynamic import error detected - this is usually a temporary Vite dev server issue');
      console.log('💡 Try refreshing the page or restarting the dev server');
    }

    // You could also send this to a logging service like Sentry, LogRocket, etc.
    // Example: logErrorToMyService(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h1>Something went wrong.</h1>
          {this.state.error?.message.includes('Failed to fetch dynamically imported module') ? (
            <div>
              <p>🔄 This appears to be a temporary loading issue with the development server.</p>
              <p><strong>Quick fixes:</strong></p>
              <ul style={{ textAlign: 'left', margin: '20px 0' }}>
                <li>• Refresh the page (Ctrl+F5 or Cmd+Shift+R)</li>
                <li>• Check if the frontend dev server is running</li>
                <li>• Restart the dev server: <code>npm run dev</code></li>
                <li>• Clear browser cache</li>
              </ul>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                🔄 Refresh Page
              </button>
            </div>
          ) : (
            <div>
              <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
              {this.state.error && <p style={{ color: 'red' }}>Error: {this.state.error.message}</p>}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;