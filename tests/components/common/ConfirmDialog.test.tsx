import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('ConfirmDialog', () => {
  it('confirms and cancels with accessible actions', async () => {
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

    expect(screen.getByRole('dialog', { name: 'Cancel booking' })).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Keep booking' }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Yes, cancel' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
