import { useUiStore } from './uiStore';

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ isMobileNavOpen: false });
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
});
