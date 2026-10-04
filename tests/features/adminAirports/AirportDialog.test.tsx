import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AirportDialog } from '@/features/adminAirports/components/AirportDialog';
import { createSeedAdminAirports } from '@/features/adminAirports';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AirportDialog', () => {
  const airport = createSeedAdminAirports()[0]!;

  it('renders create mode title and actions with defaults', async () => {
    const user = userEvent.setup({ delay: null });
    const onClose = jest.fn();
    const onSubmit = jest.fn();

    renderWithProviders(
      <AirportDialog open mode="create" onClose={onClose} onSubmit={onSubmit} />,
    );

    expect(screen.getByRole('heading', { name: 'Create airport' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create airport' })).toBeEnabled();
    expect(screen.getByLabelText(/code/i)).toHaveValue('');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders edit mode with airport code and prefilled form', () => {
    renderWithProviders(
      <AirportDialog
        open
        mode="edit"
        airport={airport}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: `Edit ${airport.code}` })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
    expect(screen.getByLabelText(/code/i)).toHaveValue(airport.code);
    expect(screen.getByLabelText(/^name/i)).toHaveValue(airport.name);
  });

  it('falls back to Edit airport when edit mode has no airport code', () => {
    renderWithProviders(
      <AirportDialog open mode="edit" airport={null} onClose={jest.fn()} onSubmit={jest.fn()} />,
    );

    expect(screen.getByRole('heading', { name: 'Edit airport' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('disables cancel and shows Creating label while submitting in create mode', () => {
    renderWithProviders(
      <AirportDialog
        open
        mode="create"
        submitting
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
  });

  it('shows Saving label while submitting in edit mode', () => {
    renderWithProviders(
      <AirportDialog
        open
        mode="edit"
        airport={airport}
        submitting
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
  });
});
