import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from '@/components/common/ErrorState';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('ErrorState', () => {
  it('uses the default title and CircleAlert icon when omit optional props', () => {
    renderWithProviders(<ErrorState message="Unable to load flights." />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Something went wrong');
    expect(alert).toHaveTextContent('Unable to load flights.');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
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
});
