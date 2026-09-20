import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppButton } from '@/components/common/AppButton';
import { AppDialog } from '@/components/common/AppDialog';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AppDialog', () => {
  it('renders an accessible dialog with title and content when open', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AppDialog open title="Passenger details" onClose={onClose}>
        Review traveler information before continuing.
      </AppDialog>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Passenger details' });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Review traveler information before continuing.')).toBeInTheDocument();
    expect(document.getElementById('app-dialog-title')).toHaveTextContent('Passenger details');
    expect(dialog).toHaveAttribute('aria-labelledby', 'app-dialog-title');
  });

  it('does not show dialog content when closed', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AppDialog open={false} title="Hidden dialog" onClose={onClose}>
        Should stay closed
      </AppDialog>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Should stay closed')).not.toBeInTheDocument();
  });

  it('renders actions when provided and omits them otherwise', () => {
    const onClose = jest.fn();
    const { rerender } = renderWithProviders(
      <AppDialog
        open
        title="With actions"
        onClose={onClose}
        actions={<AppButton>Save changes</AppButton>}
      >
        Body with actions
      </AppDialog>,
    );

    expect(document.querySelector('.MuiDialogActions-root')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();

    rerender(
      <AppDialog open title="Without actions" onClose={onClose}>
        Body without actions
      </AppDialog>,
    );

    expect(document.querySelector('.MuiDialogActions-root')).not.toBeInTheDocument();
  });

  it('uses default fullWidth and maxWidth values', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AppDialog open title="Default sizing" onClose={onClose}>
        Default size body
      </AppDialog>,
    );

    const paper = document.querySelector('.MuiDialog-paper');
    expect(paper).toHaveClass('MuiDialog-paperFullWidth');
    expect(paper).toHaveClass('MuiDialog-paperWidthSm');
  });

  it('allows overriding fullWidth and maxWidth', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AppDialog open title="Custom sizing" onClose={onClose} fullWidth={false} maxWidth="md">
        Custom size body
      </AppDialog>,
    );

    const paper = document.querySelector('.MuiDialog-paper');
    expect(paper).not.toHaveClass('MuiDialog-paperFullWidth');
    expect(paper).toHaveClass('MuiDialog-paperWidthMd');
  });

  it('invokes onClose when the dialog requests close', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    renderWithProviders(
      <AppDialog open title="Closeable dialog" onClose={onClose}>
        Press escape to dismiss
      </AppDialog>,
    );

    expect(screen.getByRole('dialog', { name: 'Closeable dialog' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('forwards additional Dialog props', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AppDialog
        open
        title="Props dialog"
        onClose={onClose}
        data-testid="app-dialog"
        className="custom-app-dialog"
      >
        Extra props body
      </AppDialog>,
    );

    const dialog = screen.getByTestId('app-dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass('custom-app-dialog');
    expect(screen.getByRole('dialog', { name: 'Props dialog' })).toBeInTheDocument();
  });
});
