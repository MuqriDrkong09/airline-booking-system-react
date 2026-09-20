import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppModal } from '@/components/common/AppModal';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AppModal', () => {
  it('renders an accessible modal with title and content when open', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AppModal open title="Seat selection" onClose={onClose}>
        Choose your preferred seat.
      </AppModal>,
    );

    const title = screen.getByRole('heading', { name: 'Seat selection' });
    expect(title).toHaveAttribute('id', 'app-modal-title');
    expect(screen.getByText('Choose your preferred seat.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
  });

  it('does not show modal content when closed', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AppModal open={false} title="Hidden modal" onClose={onClose}>
        Should stay closed
      </AppModal>,
    );

    expect(screen.queryByRole('heading', { name: 'Hidden modal' })).not.toBeInTheDocument();
    expect(screen.queryByText('Should stay closed')).not.toBeInTheDocument();
  });

  it('shows a close button by default and calls onClose when clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    renderWithProviders(
      <AppModal open title="Closeable modal" onClose={onClose}>
        Body content
      </AppModal>,
    );

    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides the close button when showCloseButton is false', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AppModal open title="No close button" onClose={onClose} showCloseButton={false}>
        Body without close control
      </AppModal>,
    );

    expect(screen.queryByRole('button', { name: 'Close dialog' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No close button' })).toBeInTheDocument();
  });

  it('accepts a custom numeric width', () => {
    const onClose = jest.fn();

    const { rerender } = renderWithProviders(
      <AppModal open title="Default width" onClose={onClose}>
        Default body
      </AppModal>,
    );

    expect(screen.getByRole('heading', { name: 'Default width' })).toBeInTheDocument();

    rerender(
      <AppModal open title="Wide modal" onClose={onClose} width={720}>
        Wide body
      </AppModal>,
    );

    expect(screen.getByRole('heading', { name: 'Wide modal' })).toBeInTheDocument();
    expect(screen.getByText('Wide body')).toBeInTheDocument();
  });

  it('accepts a string width value', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AppModal open title="Percent width" onClose={onClose} width="60%">
        Percent body
      </AppModal>,
    );

    expect(screen.getByRole('heading', { name: 'Percent width' })).toBeInTheDocument();
    expect(screen.getByText('Percent body')).toBeInTheDocument();
  });

  it('invokes onClose when the modal requests close via Escape', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    renderWithProviders(
      <AppModal open title="Escape modal" onClose={onClose}>
        Press escape to dismiss
      </AppModal>,
    );

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('forwards additional Modal props', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AppModal
        open
        title="Props modal"
        onClose={onClose}
        data-testid="app-modal"
        className="custom-app-modal"
      >
        Extra props body
      </AppModal>,
    );

    const modal = screen.getByTestId('app-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveClass('custom-app-modal');
    expect(within(modal).getByText('Extra props body')).toBeInTheDocument();
  });
});
