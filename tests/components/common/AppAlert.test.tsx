import { screen } from '@testing-library/react';
import { AppAlert } from '@/components/common/AppAlert';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AppAlert', () => {
  it('renders children with default info severity and alert role', () => {
    renderWithProviders(<AppAlert>Search criteria ready</AppAlert>);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Search criteria ready');
    expect(alert).toHaveClass('MuiAlert-standard');
    expect(alert).toHaveClass('MuiAlert-colorInfo');
  });

  it('renders an optional title', () => {
    renderWithProviders(
      <AppAlert title="Search criteria" severity="success">
        Flight selected successfully.
      </AppAlert>,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Search criteria');
    expect(alert).toHaveTextContent('Flight selected successfully.');
    expect(alert.querySelector('.MuiAlertTitle-root')).toHaveTextContent('Search criteria');
    expect(alert).toHaveClass('MuiAlert-colorSuccess');
  });

  it('omits the title when not provided', () => {
    const { container } = renderWithProviders(<AppAlert>No title here</AppAlert>);

    expect(container.querySelector('.MuiAlertTitle-root')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('No title here');
  });

  it.each([
    ['error', 'MuiAlert-colorError'],
    ['warning', 'MuiAlert-colorWarning'],
    ['success', 'MuiAlert-colorSuccess'],
    ['info', 'MuiAlert-colorInfo'],
  ] as const)('supports %s severity', (severity, className) => {
    renderWithProviders(<AppAlert severity={severity}>Severity message</AppAlert>);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standard');
    expect(alert).toHaveClass(className);
  });

  it('supports outlined and filled variants', () => {
    const { rerender } = renderWithProviders(
      <AppAlert variant="outlined" severity="warning">
        Outlined warning
      </AppAlert>,
    );

    let alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-outlined');
    expect(alert).toHaveClass('MuiAlert-colorWarning');

    rerender(
      <AppAlert variant="filled" severity="error">
        Filled error
      </AppAlert>,
    );

    alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filled');
    expect(alert).toHaveClass('MuiAlert-colorError');
  });

  it('forwards additional Alert props', () => {
    renderWithProviders(
      <AppAlert id="booking-alert" data-testid="app-alert" aria-live="assertive">
        Extra props
      </AppAlert>,
    );

    const alert = screen.getByTestId('app-alert');
    expect(alert).toHaveAttribute('id', 'booking-alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('role', 'alert');
  });
});
