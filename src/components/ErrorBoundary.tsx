import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logError } from '@/lib/logger';

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean };

/** Catches render-time crashes so users see a recovery screen instead of a blank page. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logError('ErrorBoundary', error);
    if (info.componentStack) console.error(info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-500 mb-6">Please reload the page and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#008753] text-white font-bold px-6 py-3 rounded-2xl text-sm"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
