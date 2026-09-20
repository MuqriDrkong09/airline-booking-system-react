import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm, useAuthStore } from '@/features/auth';
import { AuthApiError } from '@/services/auth';
import { renderWithProviders } from '@tests/utils/test-utils';
import { resetAuthStore } from '@tests/utils/authTestUtils';

async function fillValidRegistrationForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText(/^Title/i));
  await user.click(await screen.findByRole('option', { name: 'Mr' }));

  await user.type(screen.getByLabelText(/^First name/i), 'Alex');
  await user.type(screen.getByLabelText(/^Last name/i), 'Traveler');
  await user.type(screen.getByLabelText(/^Email/i), 'alex@example.com');
  await user.type(screen.getByLabelText(/^Phone/i), '+60 12 345 6789');
  await user.type(screen.getByLabelText(/^Date of birth/i), '1995-06-15');

  await user.click(screen.getByLabelText(/^Nationality/i));
  await user.click(await screen.findByRole('option', { name: 'Malaysia' }));

  await user.type(screen.getByLabelText(/^Password/i), 'Password123!');
  await user.type(screen.getByLabelText(/^Confirm password/i), 'Password123!');
  await user.click(screen.getByRole('checkbox', { name: /terms and conditions/i }));
}

describe('RegisterForm', () => {
  const originalRegister = useAuthStore.getState().register;

  beforeEach(() => {
    resetAuthStore();
  });

  afterEach(() => {
    useAuthStore.setState({ register: originalRegister, error: null, isSubmitting: false });
  });

  it('shows validation messages for required fields', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    renderWithProviders(<RegisterForm onSuccess={onSuccess} />);

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText(/Title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/You must accept the terms and conditions/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it(
    'calls onSuccess after a successful registration',
    async () => {
      // Instant keystrokes — full form fill is otherwise too slow for the default timeout.
      const user = userEvent.setup({ delay: null });
      const onSuccess = jest.fn();
      useAuthStore.setState({
        register: jest.fn().mockResolvedValue('Registration successful'),
      });

      renderWithProviders(<RegisterForm onSuccess={onSuccess} />);
      await fillValidRegistrationForm(user);
      await user.click(screen.getByRole('button', { name: 'Create account' }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith('Registration successful');
      });
    },
    15000,
  );

  it(
    'surfaces API errors from the auth store',
    async () => {
      const user = userEvent.setup({ delay: null });
      useAuthStore.setState({
        register: jest.fn().mockImplementation(async () => {
          useAuthStore.setState({ error: 'An account with this email already exists.' });
          throw new AuthApiError('An account with this email already exists.', { status: 409 });
        }),
      });

      renderWithProviders(<RegisterForm />);
      await fillValidRegistrationForm(user);
      await user.click(screen.getByRole('button', { name: 'Create account' }));

      expect(
        await screen.findByText('An account with this email already exists.'),
      ).toBeInTheDocument();
      expect(
        within(screen.getByRole('alert')).getByText(/Registration failed/i),
      ).toBeInTheDocument();
    },
    15000,
  );
});
