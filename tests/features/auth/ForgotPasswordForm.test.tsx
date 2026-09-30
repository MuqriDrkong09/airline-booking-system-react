import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordForm, useAuthStore } from '@/features/auth';
import { AuthApiError } from '@/services/auth';
import { renderWithProviders } from '@tests/utils/test-utils';
import { resetAuthStore } from '@tests/utils/authTestUtils';

describe('ForgotPasswordForm', () => {
  const originalForgotPassword = useAuthStore.getState().forgotPassword;

  beforeEach(() => {
    resetAuthStore();
  });

  afterEach(() => {
    act(() => {
      useAuthStore.setState({
        forgotPassword: originalForgotPassword,
        error: null,
        isSubmitting: false,
      });
    });
  });

  it('shows an error for an invalid email', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    renderWithProviders(<ForgotPasswordForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/^Email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByText(/Enter a valid email address/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onSuccess after a successful request', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const message = 'If an account exists, reset instructions have been sent.';
    const forgotPassword = jest.fn().mockResolvedValue(message);
    useAuthStore.setState({ forgotPassword });

    renderWithProviders(<ForgotPasswordForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/^Email/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(onSuccess).toHaveBeenCalledWith(message);
    });
  });

  it('submits successfully without an onSuccess callback', async () => {
    const user = userEvent.setup();
    const forgotPassword = jest.fn().mockResolvedValue('Reset link sent.');
    useAuthStore.setState({ forgotPassword });

    renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/^Email/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith({ email: 'user@example.com' });
    });
  });

  it('surfaces failed request errors from the auth store', async () => {
    const user = userEvent.setup();
    useAuthStore.setState({
      forgotPassword: jest.fn().mockImplementation(async () => {
        useAuthStore.setState({ error: 'Unable to start password reset.' });
        throw new AuthApiError('Unable to start password reset.', { status: 500 });
      }),
    });

    renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/^Email/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByText('Unable to start password reset.')).toBeInTheDocument();
    expect(screen.getByText(/Request failed/i)).toBeInTheDocument();
  });

  it('renders helper text for the email field', () => {
    renderWithProviders(<ForgotPasswordForm />);

    expect(
      screen.getByText(/We will send reset instructions if an account exists/i),
    ).toBeInTheDocument();
  });
});
