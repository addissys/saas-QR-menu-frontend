import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  props: Props;
  state: State = { hasError: false };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }


  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
            <p className="text-sm text-slate-600">
              An unexpected error occurred in the application interface.
            </p>
            {error && (
              <div className="p-3 bg-slate-100 rounded-lg text-xs font-mono text-slate-700 text-left overflow-x-auto">
                {error.message}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium text-sm hover:bg-purple-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children || null;
  }
}