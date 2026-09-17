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
    useAuthStore.setState({ login: originalLogin });
  });

  it('validates required fields before submitting', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    renderWithProviders(<LoginForm onSuccess={onSuccess} />);

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText(/Enter a valid email address/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onSuccess after a successful login', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    useAuthStore.setState({
      login: jest.fn().mockResolvedValue(mockCustomerUser),
    });

    renderWithProviders(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/^Email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^Password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockCustomerUser);
    });
  });

  it('surfaces login errors from the auth store', async () => {
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
  });
});
