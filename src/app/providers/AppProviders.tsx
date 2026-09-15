import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PageLoader } from '@/components/common/PageLoader';
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
          <Suspense fallback={<PageLoader fullPage label="Loading application" />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </AppThemeProvider>
    </QueryProvider>
  );
}
