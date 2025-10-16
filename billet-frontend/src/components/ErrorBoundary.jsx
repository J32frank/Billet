import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'rgb(12, 12, 12)' }}>
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgb(239, 68, 68, 0.2)' }}>
              <AlertTriangle size={32} style={{ color: 'rgb(239, 68, 68)' }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'white' }}>Something went wrong</h2>
            <p className="mb-6" style={{ color: 'rgb(248, 248, 255)', opacity: 0.7 }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto"
              style={{ backgroundColor: 'rgb(59, 130, 246)', color: 'white' }}
            >
              <RefreshCw size={16} />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;