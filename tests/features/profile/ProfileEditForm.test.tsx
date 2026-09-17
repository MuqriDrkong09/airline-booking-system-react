import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppThemeProvider } from '@/app/providers/ThemeProvider';
import { ProfileEditForm } from '@/features/profile';
import { authApi } from '@/services/auth';
import { DEFAULT_TRAVEL_PREFERENCES } from '@/types/profile';
import { mockCustomerUser } from '@tests/utils/authTestUtils';
import { render } from '@testing-library/react';

jest.mock('@/services/auth', () => {
  const actual = jest.requireActual('@/services/auth');
  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      updateProfile: jest.fn(),
    },
  };
});

function renderForm(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <AppThemeProvider>
          <MemoryRouter>{children}</MemoryRouter>
        </AppThemeProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}

describe('ProfileEditForm', () => {
  const profileUser = {
    ...mockCustomerUser,
    title: 'MR' as const,
    phone: '+1 555 0100',
    dateOfBirth: '1990-04-12',
    nationality: 'US',
    travelPreferences: { ...DEFAULT_TRAVEL_PREFERENCES },
  };

  beforeEach(() => {
    jest.mocked(authApi.updateProfile).mockReset();
  });

  it('keeps save disabled until the form is dirty', () => {
    renderForm(<ProfileEditForm user={profileUser} />);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('submits updated profile details', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    jest.mocked(authApi.updateProfile).mockResolvedValue({
      ...profileUser,
      phone: '+1 555 0199',
    });

    renderForm(<ProfileEditForm user={profileUser} onSuccess={onSuccess} />);

    const phoneInput = screen.getByLabelText(/^Phone/i);
    await user.clear(phoneInput);
    await user.type(phoneInput, '+1 555 0199');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(authApi.updateProfile).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith('Profile updated successfully.');
    });
  });

  it('shows API errors when save fails', async () => {
    const user = userEvent.setup();
    jest.mocked(authApi.updateProfile).mockRejectedValue(new Error('Server unavailable'));

    renderForm(<ProfileEditForm user={profileUser} />);

    const phoneInput = screen.getByLabelText(/^Phone/i);
    await user.clear(phoneInput);
    await user.type(phoneInput, '+1 555 0199');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Server unavailable')).toBeInTheDocument();
  });
});
