import { resolveColorScheme, useUiStore } from '@/app/store/uiStore';

function mockMatchMedia(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

describe('useUiStore', () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
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

  it('sets each theme mode explicitly', () => {
    useUiStore.getState().setThemeMode('light');
    expect(useUiStore.getState().themeMode).toBe('light');

    useUiStore.getState().setThemeMode('dark');
    expect(useUiStore.getState().themeMode).toBe('dark');

    useUiStore.getState().setThemeMode('system');
    expect(useUiStore.getState().themeMode).toBe('system');
  });

  it('toggles from dark to light and light to dark', () => {
    useUiStore.getState().setThemeMode('dark');
    useUiStore.getState().toggleColorScheme();
    expect(useUiStore.getState().themeMode).toBe('light');

    useUiStore.getState().toggleColorScheme();
    expect(useUiStore.getState().themeMode).toBe('dark');
  });

  it('toggles system mode to light when the OS prefers dark', () => {
    mockMatchMedia(true);
    useUiStore.getState().setThemeMode('system');

    useUiStore.getState().toggleColorScheme();
    expect(useUiStore.getState().themeMode).toBe('light');
  });

  it('toggles system mode to dark when the OS prefers light', () => {
    mockMatchMedia(false);
    useUiStore.getState().setThemeMode('system');

    useUiStore.getState().toggleColorScheme();
    expect(useUiStore.getState().themeMode).toBe('dark');
  });

  it('persists theme mode but not mobile nav state', () => {
    useUiStore.getState().setThemeMode('dark');
    useUiStore.getState().openMobileNav();

    const raw = localStorage.getItem('aerobook-ui');
    expect(raw).toBeTruthy();

    const persisted = JSON.parse(raw!) as {
      state: { themeMode?: string; isMobileNavOpen?: boolean };
    };

    expect(persisted.state.themeMode).toBe('dark');
    expect(persisted.state.isMobileNavOpen).toBeUndefined();
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
