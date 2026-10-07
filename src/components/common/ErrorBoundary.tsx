import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import {
  UNEXPECTED_ERROR_MESSAGE,
  logApiError,
} from '@/services/api';
import { ErrorState } from './ErrorState';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logApiError(error, {
      source: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
    });
  }

  private readonly handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorState
          title="Something went wrong"
          message={UNEXPECTED_ERROR_MESSAGE}
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
