import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { UNEXPECTED_ERROR_MESSAGE } from '@/services/api';
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

  it('renders a user-friendly ErrorState when a child throws', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByText(UNEXPECTED_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText('Boom')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('logs the error in development via logApiError', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ProblemChild message="Logged failure" />
      </ErrorBoundary>,
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[ApiError]',
      expect.objectContaining({
        source: 'ErrorBoundary',
        message: 'Logged failure',
      }),
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

  it('does not expose thrown technical messages in the default fallback', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ProblemChild message="Seat map crashed at Object.render" />
      </ErrorBoundary>,
    );

    expect(screen.getByText(UNEXPECTED_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(/Seat map crashed/i)).not.toBeInTheDocument();
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
