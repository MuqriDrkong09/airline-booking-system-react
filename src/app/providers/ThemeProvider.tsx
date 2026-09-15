import { CssBaseline, ThemeProvider } from '@mui/material';
import type { ReactNode } from 'react';
import { appTheme } from '../theme/theme';

interface AppThemeProviderProps {
  children: ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
