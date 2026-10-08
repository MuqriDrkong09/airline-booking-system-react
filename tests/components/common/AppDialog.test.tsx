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
    expect(
      within(dialog).getByText('Review traveler information before continuing.'),
    ).toBeInTheDocument();

    const title = within(dialog).getByRole('heading', { name: 'Passenger details' });
    expect(title).toBeInTheDocument();

    const labelledBy = dialog.getAttribute('aria-labelledby');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    expect(title).toHaveAttribute('id', labelledBy);
    expect(document.getElementById(describedBy!)).toHaveTextContent(
      'Review traveler information before continuing.',
    );
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

  it('shows a close button by default when actions are omitted', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AppDialog open title="No actions" onClose={onClose}>
        Body without actions
      </AppDialog>,
    );

    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    expect(document.querySelector('.MuiDialogActions-root')).not.toBeInTheDocument();
  });

  it('hides the close button by default when actions are provided', () => {
    const onClose = jest.fn();

    renderWithProviders(
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
    expect(screen.queryByRole('button', { name: 'Close dialog' })).not.toBeInTheDocument();
  });

  it('respects an explicit showCloseButton override', () => {
    const onClose = jest.fn();
    const { rerender } = renderWithProviders(
      <AppDialog
        open
        title="Force close"
        onClose={onClose}
        showCloseButton
        actions={<AppButton>Confirm</AppButton>}
      >
        Actions plus close control
      </AppDialog>,
    );

    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();

    rerender(
      <AppDialog open title="Hide close" onClose={onClose} showCloseButton={false}>
        Content only
      </AppDialog>,
    );

    expect(screen.queryByRole('button', { name: 'Close dialog' })).not.toBeInTheDocument();
  });

  it('invokes onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    renderWithProviders(
      <AppDialog open title="Closeable dialog" onClose={onClose}>
        Use the close control
      </AppDialog>,
    );

    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('invokes onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    renderWithProviders(
      <AppDialog open title="Escape dialog" onClose={onClose}>
        Press escape to dismiss
      </AppDialog>,
    );

    expect(screen.getByRole('dialog', { name: 'Escape dialog' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
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

  it('keeps unique labelled title ids when multiple dialogs mount', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <>
        <AppDialog open title="First dialog" onClose={onClose}>
          First body
        </AppDialog>
        <AppDialog open title="Second dialog" onClose={onClose}>
          Second body
        </AppDialog>
      </>,
    );

    // MUI aria-hides the lower dialog while another modal is open, so query the DOM directly.
    const titles = Array.from(document.querySelectorAll('.MuiDialogTitle-root'));
    expect(titles).toHaveLength(2);
    expect(titles[0]).toHaveTextContent('First dialog');
    expect(titles[1]).toHaveTextContent('Second dialog');
    expect(titles[0]?.id).toBeTruthy();
    expect(titles[1]?.id).toBeTruthy();
    expect(titles[0]?.id).not.toBe(titles[1]?.id);
  });
});

