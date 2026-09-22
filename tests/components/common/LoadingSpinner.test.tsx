import { screen, within } from '@testing-library/react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('LoadingSpinner', () => {
  it('renders a status region with a visually hidden Loading label by default', () => {
    renderWithProviders(<LoadingSpinner />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(within(status).getByText('Loading')).toBeInTheDocument();
    expect(document.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
  });

  it('shows a visible label when provided', () => {
    renderWithProviders(<LoadingSpinner label="Finding flights…" />);

    expect(screen.getByRole('status')).toHaveTextContent('Finding flights…');
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  it('returns the status node directly when not centered', () => {
    const { container } = renderWithProviders(<LoadingSpinner centered={false} />);

    expect(container.querySelector('[role="status"]')).toBe(container.firstElementChild);
  });

  it('wraps the spinner in a centered layout when centered is true', () => {
    const { container } = renderWithProviders(
      <LoadingSpinner centered label="Please wait" />,
    );

    const status = screen.getByRole('status');
    expect(container.firstElementChild).not.toBe(status);
    expect(container.firstElementChild?.contains(status)).toBe(true);
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });

  it('forwards CircularProgress props such as size and color', () => {
    renderWithProviders(<LoadingSpinner size={48} color="secondary" label="Saving" />);

    const progress = document.querySelector('.MuiCircularProgress-root');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveClass('MuiCircularProgress-colorSecondary');
    expect(screen.getByText('Saving')).toBeInTheDocument();
  });
});
