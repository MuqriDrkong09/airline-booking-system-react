import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { renderWithProviders } from '@tests/utils/test-utils';

function ProblemChild(): never {
  throw new Error('Boom');
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

  it('renders fallback UI when a child throws', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByText('Boom')).toBeInTheDocument();
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

    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByText('All clear')).toBeInTheDocument();
  });
});
