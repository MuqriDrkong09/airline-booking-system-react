import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppThemeProvider } from '@/app/providers/ThemeProvider';
import { QueryProvider } from '@/app/providers/QueryProvider';

interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <AppThemeProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </AppThemeProvider>
    </QueryProvider>
  );
}

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: Providers, ...options });
}

export { screen } from '@testing-library/react';
