import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppThemeProvider } from '@/app/providers/ThemeProvider';
import { QueryProvider } from '@/app/providers/QueryProvider';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
}

function createProviders(initialEntries?: string[]) {
  return function Providers({ children }: { children: ReactNode }) {
    return (
      <QueryProvider>
        <AppThemeProvider>
          <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </AppThemeProvider>
      </QueryProvider>
    );
  };
}

export function renderWithProviders(ui: ReactElement, options?: RenderWithProvidersOptions) {
  const { initialEntries, ...renderOptions } = options ?? {};

  return render(ui, {
    wrapper: createProviders(initialEntries),
    ...renderOptions,
  });
}

export { screen } from '@testing-library/react';
