import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VerifyEmailForm, useAuthStore } from '@/features/auth';
import { AuthApiError } from '@/services/auth';
import { renderWithProviders } from '@tests/utils/test-utils';
import { resetAuthStore } from '@tests/utils/authTestUtils';

describe('VerifyEmailForm', () => {
  const originalVerifyEmail = useAuthStore.getState().verifyEmail;

  beforeEach(() => {
    resetAuthStore();
  });

  afterEach(() => {
    act(() => {
      useAuthStore.setState({
        verifyEmail: originalVerifyEmail,
        error: null,
        isSubmitting: false,
      });
    });
  });

  it('shows an error when the verification token is missing', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    renderWithProviders(<VerifyEmailForm onSuccess={onSuccess} />);

    await user.click(screen.getByRole('button', { name: 'Verify email' }));

    expect(await screen.findByText(/Verification token is required/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('prefills the token from defaultToken', () => {
    renderWithProviders(<VerifyEmailForm defaultToken="verify-token-123" />);

    expect(screen.getByLabelText(/^Verification token/i)).toHaveValue('verify-token-123');
  });

  it('calls onSuccess after a successful verification', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const message = 'Your email has been verified.';
    const verifyEmail = jest.fn().mockResolvedValue(message);
    useAuthStore.setState({ verifyEmail });

    renderWithProviders(<VerifyEmailForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/^Verification token/i), 'verify-token-123');
    await user.click(screen.getByRole('button', { name: 'Verify email' }));

    await waitFor(() => {
      expect(verifyEmail).toHaveBeenCalledWith({ token: 'verify-token-123' });
      expect(onSuccess).toHaveBeenCalledWith(message);
    });
  });

  it('submits successfully without an onSuccess callback', async () => {
    const user = userEvent.setup();
    const verifyEmail = jest.fn().mockResolvedValue('Email verified.');
    useAuthStore.setState({ verifyEmail });

    renderWithProviders(<VerifyEmailForm defaultToken="verify-token-123" />);

    await user.click(screen.getByRole('button', { name: 'Verify email' }));

    await waitFor(() => {
      expect(verifyEmail).toHaveBeenCalledWith({ token: 'verify-token-123' });
    });
  });

  it('surfaces failed verification errors from the auth store', async () => {
    const user = userEvent.setup();
    useAuthStore.setState({
      verifyEmail: jest.fn().mockImplementation(async () => {
        useAuthStore.setState({ error: 'Verification link is invalid or expired.' });
        throw new AuthApiError('Verification link is invalid or expired.', { status: 400 });
      }),
    });

    renderWithProviders(<VerifyEmailForm />);

    await user.type(screen.getByLabelText(/^Verification token/i), 'bad-token');
    await user.click(screen.getByRole('button', { name: 'Verify email' }));

    expect(
      await screen.findByText('Verification link is invalid or expired.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Verification failed/i)).toBeInTheDocument();
  });
});
