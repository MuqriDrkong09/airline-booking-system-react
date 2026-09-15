import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorScheme } from '@/app/theme';

export type ThemeMode = ColorScheme | 'system';

interface UiState {
  isMobileNavOpen: boolean;
  themeMode: ThemeMode;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleColorScheme: () => void;
}

function resolveNextScheme(current: ThemeMode): ColorScheme {
  if (current === 'dark') {
    return 'light';
  }

  if (current === 'light') {
    return 'dark';
  }

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'light';
  }

  return 'dark';
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      isMobileNavOpen: false,
      themeMode: 'system',
      openMobileNav: () => set({ isMobileNavOpen: true }),
      closeMobileNav: () => set({ isMobileNavOpen: false }),
      toggleMobileNav: () =>
        set((state) => ({
          isMobileNavOpen: !state.isMobileNavOpen,
        })),
      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleColorScheme: () => set({ themeMode: resolveNextScheme(get().themeMode) }),
    }),
    {
      name: 'aerobook-ui',
      partialize: (state) => ({ themeMode: state.themeMode }),
    },
  ),
);

export function resolveColorScheme(
  themeMode: ThemeMode,
  prefersDark: boolean,
): ColorScheme {
  if (themeMode === 'system') {
    return prefersDark ? 'dark' : 'light';
  }

  return themeMode;
}
