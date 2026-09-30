import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetPasswordForm, useAuthStore } from '@/features/auth';
import { AuthApiError } from '@/services/auth';
import { renderWithProviders } from '@tests/utils/test-utils';
import { resetAuthStore } from '@tests/utils/authTestUtils';

async function fillValidForm(
  user: ReturnType<typeof userEvent.setup>,
  options?: { token?: string; password?: string; confirmPassword?: string },
) {
  const token = options?.token ?? 'reset-token-123';
  const password = options?.password ?? 'Password123!';
  const confirmPassword = options?.confirmPassword ?? password;

  const tokenInput = screen.getByLabelText(/^Reset token/i);
  if ((tokenInput as HTMLInputElement).value !== token) {
    await user.clear(tokenInput);
    await user.type(tokenInput, token);
  }

  await user.type(screen.getByLabelText(/^New password/i), password);
  await user.type(screen.getByLabelText(/^Confirm new password/i), confirmPassword);
}

describe('ResetPasswordForm', () => {
  const originalResetPassword = useAuthStore.getState().resetPassword;

  beforeEach(() => {
    resetAuthStore();
  });

  afterEach(() => {
    act(() => {
      useAuthStore.setState({
        resetPassword: originalResetPassword,
        error: null,
        isSubmitting: false,
      });
    });
  });

  it('shows an error when the reset token is missing', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    renderWithProviders(<ResetPasswordForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/^New password/i), 'Password123!');
    await user.type(screen.getByLabelText(/^Confirm new password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByText(/Reset token is required/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows an error for a weak password', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    renderWithProviders(<ResetPasswordForm onSuccess={onSuccess} />);

    await fillValidForm(user, { password: 'short', confirmPassword: 'short' });
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows an error when passwords do not match', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    renderWithProviders(<ResetPasswordForm onSuccess={onSuccess} />);

    await fillValidForm(user, {
      password: 'Password123!',
      confirmPassword: 'Different123!',
    });
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('prefills the token from defaultToken', () => {
    renderWithProviders(<ResetPasswordForm defaultToken="prefilled-token" />);

    expect(screen.getByLabelText(/^Reset token/i)).toHaveValue('prefilled-token');
  });

  it('calls onSuccess after a successful reset', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const message = 'Your password has been updated.';
    const resetPassword = jest.fn().mockResolvedValue(message);
    useAuthStore.setState({ resetPassword });

    renderWithProviders(<ResetPasswordForm onSuccess={onSuccess} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith({
        token: 'reset-token-123',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(onSuccess).toHaveBeenCalledWith(message);
    });
  });

  it('submits successfully without an onSuccess callback', async () => {
    const user = userEvent.setup();
    const resetPassword = jest.fn().mockResolvedValue('Password updated.');
    useAuthStore.setState({ resetPassword });

    renderWithProviders(<ResetPasswordForm defaultToken="reset-token-123" />);

    await user.type(screen.getByLabelText(/^New password/i), 'Password123!');
    await user.type(screen.getByLabelText(/^Confirm new password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith({
        token: 'reset-token-123',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
    });
  });

  it('surfaces failed reset errors from the auth store', async () => {
    const user = userEvent.setup();
    useAuthStore.setState({
      resetPassword: jest.fn().mockImplementation(async () => {
        useAuthStore.setState({ error: 'Reset link is invalid or expired.' });
        throw new AuthApiError('Reset link is invalid or expired.', { status: 400 });
      }),
    });

    renderWithProviders(<ResetPasswordForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByText('Reset link is invalid or expired.')).toBeInTheDocument();
    expect(screen.getByText(/Reset failed/i)).toBeInTheDocument();
  });
});
