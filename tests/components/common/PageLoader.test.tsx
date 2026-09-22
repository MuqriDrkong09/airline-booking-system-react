import { screen } from '@testing-library/react';
import { PageLoader } from '@/components/common/PageLoader';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('PageLoader', () => {
  it('renders a centered spinner with the default Loading label', () => {
    const { container } = renderWithProviders(<PageLoader />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading');
    expect(document.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
    // Non-full-page mode centers via LoadingSpinner's wrapper.
    expect(container.firstElementChild).not.toBe(status);
    expect(container.firstElementChild?.contains(status)).toBe(true);
  });

  it('uses a custom label when provided', () => {
    renderWithProviders(<PageLoader label="Loading flight details…" />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading flight details…');
  });

  it('fills the viewport when fullPage is true', () => {
    const { container } = renderWithProviders(
      <PageLoader fullPage label="Restoring session…" />,
    );

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Restoring session…');
    expect(container.firstElementChild).not.toBe(status);
    expect(container.firstElementChild?.contains(status)).toBe(true);
    expect(container.firstElementChild).toHaveStyle({
      minHeight: '100vh',
      display: 'grid',
    });
  });

  it('returns the spinner directly when fullPage is false', () => {
    renderWithProviders(<PageLoader fullPage={false} label="Please wait" />);

    expect(screen.getByRole('status')).toHaveTextContent('Please wait');
  });
});
