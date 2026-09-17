import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm, useAuthStore } from '@/features/auth';
import { AuthApiError } from '@/services/auth';
import { renderWithProviders } from '@tests/utils/test-utils';
import { mockCustomerUser, resetAuthStore } from '@tests/utils/authTestUtils';

describe('LoginForm', () => {
  const originalLogin = useAuthStore.getState().login;

  beforeEach(() => {
    resetAuthStore();
  });

  afterEach(() => {
    useAuthStore.setState({ login: originalLogin, error: null, isSubmitting: false });
  });

  it('shows an error for an invalid email', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    renderWithProviders(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/^Email/i), 'not-an-email');
    await user.type(screen.getByLabelText(/^Password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText(/Enter a valid email address/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows an error when password is missing', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    renderWithProviders(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/^Email/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onSuccess after a successful login', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const login = jest.fn().mockResolvedValue(mockCustomerUser);
    useAuthStore.setState({ login });

    renderWithProviders(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/^Email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^Password/i), 'Password123!');
    await user.click(screen.getByRole('checkbox', { name: /Remember me/i }));
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password123!',
        rememberMe: true,
      });
      expect(onSuccess).toHaveBeenCalledWith(mockCustomerUser);
    });
  });

  it('surfaces failed login errors from the auth store', async () => {
    const user = userEvent.setup();
    useAuthStore.setState({
      login: jest.fn().mockImplementation(async () => {
        useAuthStore.setState({ error: 'Invalid email or password.' });
        throw new AuthApiError('Invalid email or password.', { status: 401 });
      }),
    });

    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText(/^Email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^Password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
    expect(screen.getByText(/Sign in failed/i)).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginForm />);

    const passwordInput = screen.getByLabelText(/^Password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('renders forgot password and registration links', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
    expect(screen.getByRole('link', { name: 'Create one' })).toHaveAttribute('href', '/register');
  });
});
