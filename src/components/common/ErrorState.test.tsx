import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from './ErrorState';
import { renderWithProviders } from '@/test/test-utils';

describe('ErrorState', () => {
  it('renders the error message and retry action', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();

    renderWithProviders(
      <ErrorState title="Request failed" message="The server is unavailable." onRetry={onRetry} />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Request failed');
    expect(screen.getByText('The server is unavailable.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
