import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUiStore } from '@/app/store/uiStore';
import { ThemeModeToggle } from '@/components/common/ThemeModeToggle';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('ThemeModeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useUiStore.setState({ isMobileNavOpen: false, themeMode: 'light' });
    });
  });

  it('shows the dark-mode action when the theme is light', () => {
    renderWithProviders(<ThemeModeToggle />);

    expect(
      screen.getByRole('button', { name: 'Switch to dark mode' }),
    ).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('shows the light-mode action when the theme is dark', () => {
    act(() => {
      useUiStore.getState().setThemeMode('dark');
    });

    renderWithProviders(<ThemeModeToggle />);

    expect(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    ).toBeInTheDocument();
  });

  it('toggles the color scheme when clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ThemeModeToggle />);

    expect(useUiStore.getState().themeMode).toBe('light');
    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));

    expect(useUiStore.getState().themeMode).toBe('dark');
    expect(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(useUiStore.getState().themeMode).toBe('light');
    expect(
      screen.getByRole('button', { name: 'Switch to dark mode' }),
    ).toBeInTheDocument();
  });
});
