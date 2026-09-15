import { resolveColorScheme, useUiStore } from '@/app/store/uiStore';

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ isMobileNavOpen: false, themeMode: 'system' });
  });

  it('opens and closes the mobile navigation', () => {
    useUiStore.getState().openMobileNav();
    expect(useUiStore.getState().isMobileNavOpen).toBe(true);

    useUiStore.getState().closeMobileNav();
    expect(useUiStore.getState().isMobileNavOpen).toBe(false);
  });

  it('toggles the mobile navigation', () => {
    useUiStore.getState().toggleMobileNav();
    expect(useUiStore.getState().isMobileNavOpen).toBe(true);

    useUiStore.getState().toggleMobileNav();
    expect(useUiStore.getState().isMobileNavOpen).toBe(false);
  });

  it('updates theme mode', () => {
    useUiStore.getState().setThemeMode('dark');
    expect(useUiStore.getState().themeMode).toBe('dark');

    useUiStore.getState().toggleColorScheme();
    expect(useUiStore.getState().themeMode).toBe('light');
  });
});

describe('resolveColorScheme', () => {
  it('resolves system preference', () => {
    expect(resolveColorScheme('system', true)).toBe('dark');
    expect(resolveColorScheme('system', false)).toBe('light');
  });

  it('returns explicit modes unchanged', () => {
    expect(resolveColorScheme('dark', false)).toBe('dark');
    expect(resolveColorScheme('light', true)).toBe('light');
  });
});
