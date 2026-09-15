import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { createAppTheme } from '@/app/theme';
import { resolveColorScheme, useUiStore } from '@/app/store/uiStore';

interface AppThemeProviderProps {
  children: ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const themeMode = useUiStore((state) => state.themeMode);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', {
    noSsr: true,
  });

  const theme = useMemo(() => {
    const resolvedMode = resolveColorScheme(themeMode, prefersDark);
    return createAppTheme(resolvedMode);
  }, [prefersDark, themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
