import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { renderWithProviders } from '@tests/utils/test-utils';

function ProblemChild({ message = 'Boom' }: { message?: string }): never {
  throw new Error(message);
}

function RecoverableChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Boom');
  }

  return <p>All clear</p>;
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    renderWithProviders(
      <ErrorBoundary>
        <p>Healthy child</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Healthy child')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the default ErrorState when a child throws', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByText('Boom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('logs the error in componentDidCatch', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ProblemChild message="Logged failure" />
      </ErrorBoundary>,
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error',
      expect.objectContaining({ message: 'Logged failure' }),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });

  it('renders a custom fallback when provided', () => {
    renderWithProviders(
      <ErrorBoundary fallback={<p>Custom recovery UI</p>}>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom recovery UI')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('shows the thrown message on the default fallback', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ProblemChild message="Seat map crashed" />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Seat map crashed');
  });

  it('shows a default message when the thrown value has no message', () => {
    function WeirdChild(): never {
      // React can deliver non-Error throws into the boundary.
      // eslint-disable-next-line no-throw-literal -- intentional coverage case
      throw { name: 'WeirdFailure' };
    }

    renderWithProviders(
      <ErrorBoundary>
        <WeirdChild />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('An unexpected error occurred.');
  });

  it('resets after the user retries', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function FlakyChild() {
      return <RecoverableChild shouldThrow={shouldThrow} />;
    }

    renderWithProviders(
      <ErrorBoundary>
        <FlakyChild />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByText('All clear')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
