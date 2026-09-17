import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PageLoader } from '@/components/common/PageLoader';
import { AuthBootstrap } from '@/features/auth';
import { QueryProvider } from './QueryProvider';
import { AppThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AppThemeProvider>
        <ErrorBoundary>
          <AuthBootstrap>
            <Suspense fallback={<PageLoader fullPage label="Loading application" />}>
              {children}
            </Suspense>
          </AuthBootstrap>
        </ErrorBoundary>
      </AppThemeProvider>
    </QueryProvider>
  );
}
