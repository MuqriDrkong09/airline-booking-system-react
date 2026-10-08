import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from '@/components/common/ErrorState';
import {
  ApiError,
  DEFAULT_ERROR_MESSAGE,
  getErrorMessage,
  getErrorTitle,
} from '@/services/api';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('ErrorState', () => {
  it('uses the default title, default message, and CircleAlert icon when omit optional props', () => {
    renderWithProviders(<ErrorState />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Something went wrong');
    expect(alert).toHaveTextContent(DEFAULT_ERROR_MESSAGE);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders an explicit message with the default title when no error is provided', () => {
    renderWithProviders(<ErrorState message="Unable to load flights." />);

    const alert = screen.getByRole('alert');
    expect(screen.getByRole('heading', { level: 1, name: 'Something went wrong' })).toBeInTheDocument();
    expect(alert).toHaveTextContent('Unable to load flights.');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('derives title and message from an ApiError when title/message are omitted', () => {
    const error = new ApiError('You do not have permission to perform this action.', {
      status: 403,
    });

    renderWithProviders(<ErrorState error={error} />);

    expect(
      screen.getByRole('heading', { level: 1, name: getErrorTitle(error) }),
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(getErrorMessage(error));
  });

  it('prefers explicit title and message over values derived from error', () => {
    const error = new ApiError('Server exploded.', { status: 500 });

    renderWithProviders(
      <ErrorState
        error={error}
        title="Custom failure"
        message="Please refresh the page."
      />,
    );

    expect(screen.getByRole('heading', { name: 'Custom failure' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Please refresh the page.');
    expect(screen.queryByText('Server exploded.')).not.toBeInTheDocument();
  });

  it('renders a custom title, icon, and action slot', () => {
    renderWithProviders(
      <ErrorState
        title="Request failed"
        message="The server is unavailable."
        icon={<span data-testid="custom-error-icon">!</span>}
        action={<button type="button">Contact support</button>}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Request failed' })).toBeInTheDocument();
    expect(screen.getByTestId('custom-error-icon')).toBeInTheDocument();
    expect(document.querySelector('svg')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contact support' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('calls onRetry with a custom retry label', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();

    renderWithProviders(
      <ErrorState
        title="Request failed"
        message="The server is unavailable."
        onRetry={onRetry}
        retryLabel="Retry now"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Retry now' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('uses the default retry label when onRetry is provided without retryLabel', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();

    renderWithProviders(
      <ErrorState message="Temporary outage." onRetry={onRetry} />,
    );

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders both retry and a custom action when provided together', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();

    renderWithProviders(
      <ErrorState
        message="Temporary outage."
        onRetry={onRetry}
        action={<button type="button">Go home</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go home' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
