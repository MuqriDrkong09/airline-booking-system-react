import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('ConfirmDialog', () => {
  it('renders title, string description, and default action labels', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    renderWithProviders(
      <ConfirmDialog
        open
        title="Delete passenger"
        description="This cannot be undone."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Delete passenger' });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('This cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('does not show dialog content when closed', () => {
    renderWithProviders(
      <ConfirmDialog
        open={false}
        title="Hidden confirm"
        description="Should stay closed"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Should stay closed')).not.toBeInTheDocument();
  });

  it('renders non-string description nodes as provided', () => {
    renderWithProviders(
      <ConfirmDialog
        open
        title="Custom body"
        description={
          <ul>
            <li>Seat assignment will be lost</li>
            <li>Fare rules still apply</li>
          </ul>
        }
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByText('Seat assignment will be lost')).toBeInTheDocument();
    expect(screen.getByText('Fare rules still apply')).toBeInTheDocument();
  });

  it('uses custom confirm and cancel labels', () => {
    renderWithProviders(
      <ConfirmDialog
        open
        title="Cancel booking"
        description="This cannot be undone."
        confirmLabel="Yes, cancel"
        cancelLabel="Keep booking"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Keep booking' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes, cancel' })).toBeInTheDocument();
  });

  it('applies the confirm button color', () => {
    renderWithProviders(
      <ConfirmDialog
        open
        title="Remove item"
        description="Continue?"
        confirmColor="error"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveClass('MuiButton-colorError');
  });

  it('defaults the confirm button to primary color', () => {
    renderWithProviders(
      <ConfirmDialog
        open
        title="Continue"
        description="Proceed with booking?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveClass('MuiButton-colorPrimary');
  });

  it('calls onConfirm and onCancel from the action buttons', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    renderWithProviders(
      <ConfirmDialog
        open
        title="Cancel booking"
        description="This cannot be undone."
        confirmLabel="Yes, cancel"
        cancelLabel="Keep booking"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Keep booking' }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Yes, cancel' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('routes dialog close requests to onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    renderWithProviders(
      <ConfirmDialog
        open
        title="Closeable confirm"
        description="Press escape to dismiss"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Closeable confirm' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('disables cancel and shows loading state on confirm while loading', () => {
    renderWithProviders(
      <ConfirmDialog
        open
        title="Saving"
        description="Please wait"
        loading
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Working...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Working...' })).toHaveAttribute('aria-busy', 'true');
  });
});
