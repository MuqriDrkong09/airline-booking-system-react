import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AircraftDialog, createSeedAdminAircraft } from '@/features/adminAircraft';
import { renderWithProviders } from '@tests/utils/test-utils';

function fillValidCreateForm(dialog: HTMLElement) {
  fireEvent.change(within(dialog).getByPlaceholderText('Airbus'), {
    target: { value: 'Embraer' },
  });
  fireEvent.change(within(dialog).getByPlaceholderText('A320'), {
    target: { value: 'E190' },
  });
  fireEvent.change(within(dialog).getByPlaceholderText('9M-AAA'), {
    target: { value: '9M-NEW' },
  });
  fireEvent.change(within(dialog).getByLabelText(/^Total seats/i), {
    target: { value: '100' },
  });
  fireEvent.change(within(dialog).getByLabelText(/^Economy seats/i), {
    target: { value: '96' },
  });
  fireEvent.change(within(dialog).getByLabelText(/^Premium economy seats/i), {
    target: { value: '0' },
  });
  fireEvent.change(within(dialog).getByLabelText(/^Business seats/i), {
    target: { value: '4' },
  });
  fireEvent.change(within(dialog).getByLabelText(/^First class seats/i), {
    target: { value: '0' },
  });
}

describe('AircraftDialog', () => {
  const aircraft = createSeedAdminAircraft()[0]!;

  it('renders create mode title, empty defaults, and calls onClose from Cancel', async () => {
    const user = userEvent.setup({ delay: null });
    const onClose = jest.fn();
    const onSubmit = jest.fn();

    renderWithProviders(
      <AircraftDialog open mode="create" onClose={onClose} onSubmit={onSubmit} />,
    );

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Create aircraft' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Create aircraft' })).toBeEnabled();
    expect(within(dialog).getByPlaceholderText('Airbus')).toHaveValue('');
    expect(within(dialog).getByPlaceholderText('A320')).toHaveValue('');
    expect(within(dialog).getByPlaceholderText('9M-AAA')).toHaveValue('');
    expect(within(dialog).getByLabelText(/^Total seats/i)).toHaveValue(1);
    expect(within(dialog).getByLabelText(/^Economy seats/i)).toHaveValue(1);
    expect(within(dialog).getByRole('switch', { name: 'Active' })).toBeChecked();

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders edit mode with registration title and prefilled form values', () => {
    renderWithProviders(
      <AircraftDialog
        open
        mode="edit"
        aircraft={aircraft}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: `Edit ${aircraft.registration}` }),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
    expect(within(dialog).getByPlaceholderText('Airbus')).toHaveValue(aircraft.manufacturer);
    expect(within(dialog).getByPlaceholderText('A320')).toHaveValue(aircraft.model);
    expect(within(dialog).getByPlaceholderText('9M-AAA')).toHaveValue(aircraft.registration);
    expect(within(dialog).getByLabelText(/^Total seats/i)).toHaveValue(aircraft.totalSeats);
    expect(within(dialog).getByLabelText(/^Economy seats/i)).toHaveValue(aircraft.economySeats);
    expect(within(dialog).getByLabelText(/^Business seats/i)).toHaveValue(aircraft.businessSeats);
    expect(within(dialog).getByRole('switch', { name: 'Active' })).toBeChecked();
  });

  it('falls back to Edit aircraft when edit mode has no registration', () => {
    renderWithProviders(
      <AircraftDialog open mode="edit" aircraft={null} onClose={jest.fn()} onSubmit={jest.fn()} />,
    );

    expect(screen.getByRole('heading', { name: 'Edit aircraft' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('ignores aircraft prop in create mode and keeps empty defaults', () => {
    renderWithProviders(
      <AircraftDialog
        open
        mode="create"
        aircraft={aircraft}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Create aircraft' })).toBeInTheDocument();
    expect(within(dialog).getByPlaceholderText('Airbus')).toHaveValue('');
    expect(within(dialog).getByPlaceholderText('9M-AAA')).toHaveValue('');
  });

  it('disables Cancel and shows Creating label while submitting in create mode', () => {
    renderWithProviders(
      <AircraftDialog open mode="create" submitting onClose={jest.fn()} onSubmit={jest.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
  });

  it('disables Cancel and shows Saving label while submitting in edit mode', () => {
    renderWithProviders(
      <AircraftDialog
        open
        mode="edit"
        aircraft={aircraft}
        submitting
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
  });

  it('does not expose the dialog when closed', () => {
    renderWithProviders(
      <AircraftDialog open={false} mode="create" onClose={jest.fn()} onSubmit={jest.fn()} />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('submits valid create values through the dialog action', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <AircraftDialog open mode="create" onClose={jest.fn()} onSubmit={onSubmit} />,
    );

    const dialog = screen.getByRole('dialog');
    fillValidCreateForm(dialog);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create aircraft' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        manufacturer: 'Embraer',
        model: 'E190',
        registration: '9M-NEW',
        totalSeats: 100,
        economySeats: 96,
        premiumEconomySeats: 0,
        businessSeats: 4,
        firstClassSeats: 0,
        active: true,
      }),
    );
  });

  it('submits edited values through Save changes', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <AircraftDialog
        open
        mode="edit"
        aircraft={aircraft}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />,
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByPlaceholderText('A320'), {
      target: { value: 'A320neo' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        manufacturer: aircraft.manufacturer,
        model: 'A320neo',
        registration: aircraft.registration,
        totalSeats: aircraft.totalSeats,
        active: aircraft.active,
      }),
    );
  });

  it('does not submit when required create fields are empty', async () => {
    const onSubmit = jest.fn();

    renderWithProviders(
      <AircraftDialog open mode="create" onClose={jest.fn()} onSubmit={onSubmit} />,
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create aircraft' }));

    expect(await within(dialog).findByText('Enter a manufacturer')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
