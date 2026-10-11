import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AircraftDetailsDialog,
  createSeedAdminAircraft,
  formatSeatBreakdown,
} from '@/features/adminAircraft';
import type { AdminAircraft } from '@/features/adminAircraft';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AircraftDetailsDialog', () => {
  const aircraft = createSeedAdminAircraft()[0]!;
  const inactiveAircraft = createSeedAdminAircraft().find((item) => !item.active)!;

  it('renders aircraft details, cabin counts, and seat-map configuration', () => {
    renderWithProviders(
      <AircraftDetailsDialog
        open
        aircraft={aircraft}
        onClose={jest.fn()}
        onEdit={jest.fn()}
        onConfigureSeats={jest.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByRole('heading', {
        name: `${aircraft.registration} · Airbus A320`,
      }),
    ).toBeInTheDocument();

    expect(within(dialog).getByText('Manufacturer')).toBeInTheDocument();
    expect(within(dialog).getByText(aircraft.manufacturer)).toBeInTheDocument();
    expect(within(dialog).getByText('Model')).toBeInTheDocument();
    expect(within(dialog).getByText(aircraft.model)).toBeInTheDocument();
    expect(within(dialog).getByText('Registration')).toBeInTheDocument();
    expect(within(dialog).getAllByText(aircraft.registration).length).toBeGreaterThan(0);
    expect(within(dialog).getByText('Active')).toBeInTheDocument();
    expect(within(dialog).getByText(String(aircraft.totalSeats))).toBeInTheDocument();
    expect(within(dialog).getByText(formatSeatBreakdown(aircraft))).toBeInTheDocument();
    expect(within(dialog).getByText('Economy')).toBeInTheDocument();
    expect(within(dialog).getByText(String(aircraft.economySeats))).toBeInTheDocument();
    expect(within(dialog).getByText('Premium economy')).toBeInTheDocument();
    expect(within(dialog).getByText('Business')).toBeInTheDocument();
    expect(within(dialog).getByText(String(aircraft.businessSeats))).toBeInTheDocument();
    expect(within(dialog).getByText('First class')).toBeInTheDocument();

    expect(within(dialog).getByText('Seat-map configuration')).toBeInTheDocument();
    expect(within(dialog).getByText('Layout key')).toBeInTheDocument();
    expect(within(dialog).getByText(aircraft.seatMapConfig!.layoutKey)).toBeInTheDocument();
    expect(within(dialog).getByText('Version')).toBeInTheDocument();
    expect(within(dialog).getByText(String(aircraft.seatMapConfig!.version))).toBeInTheDocument();
    expect(within(dialog).getByText('Map size')).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        `${aircraft.seatMapConfig!.rows} rows · ${aircraft.seatMapConfig!.seats.length} seats`,
      ),
    ).toBeInTheDocument();

    const cabins = within(dialog).getByLabelText('Seat-map cabins');
    expect(cabins.querySelectorAll('li').length).toBe(aircraft.seatMapConfig!.cabins.length);
    expect(within(cabins).getByText(/ECONOMY:/i)).toBeInTheDocument();
  });

  it('shows inactive status for inactive aircraft', () => {
    expect(inactiveAircraft).toBeDefined();

    renderWithProviders(
      <AircraftDetailsDialog open aircraft={inactiveAircraft} onClose={jest.fn()} />,
    );

    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('calls onClose when Close is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const onClose = jest.fn();

    renderWithProviders(
      <AircraftDetailsDialog open aircraft={aircraft} onClose={onClose} />,
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit with the current aircraft', async () => {
    const user = userEvent.setup({ delay: null });
    const onEdit = jest.fn();

    renderWithProviders(
      <AircraftDetailsDialog
        open
        aircraft={aircraft}
        onClose={jest.fn()}
        onEdit={onEdit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit aircraft' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(aircraft);
  });

  it('calls onConfigureSeats with the current aircraft', async () => {
    const user = userEvent.setup({ delay: null });
    const onConfigureSeats = jest.fn();

    renderWithProviders(
      <AircraftDetailsDialog
        open
        aircraft={aircraft}
        onClose={jest.fn()}
        onConfigureSeats={onConfigureSeats}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Configure seats' }));
    expect(onConfigureSeats).toHaveBeenCalledTimes(1);
    expect(onConfigureSeats).toHaveBeenCalledWith(aircraft);
  });

  it('hides edit and configure actions when callbacks are omitted', () => {
    renderWithProviders(
      <AircraftDetailsDialog open aircraft={aircraft} onClose={jest.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit aircraft' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Configure seats' })).not.toBeInTheDocument();
  });

  it('uses a fallback title and empty body when aircraft is null', () => {
    renderWithProviders(
      <AircraftDetailsDialog
        open
        aircraft={null}
        onClose={jest.fn()}
        onEdit={jest.fn()}
        onConfigureSeats={jest.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Aircraft details' })).toBeInTheDocument();
    expect(within(dialog).queryByText('Seat-map configuration')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Edit aircraft' })).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole('button', { name: 'Configure seats' }),
    ).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('does not expose the dialog when closed', () => {
    renderWithProviders(
      <AircraftDetailsDialog open={false} aircraft={aircraft} onClose={jest.fn()} />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows a placeholder when seat-map configuration is missing', () => {
    const withoutSeatMap: AdminAircraft = {
      ...aircraft,
      seatMapConfig: undefined as unknown as AdminAircraft['seatMapConfig'],
    };

    renderWithProviders(
      <AircraftDetailsDialog open aircraft={withoutSeatMap} onClose={jest.fn()} />,
    );

    expect(screen.getByText('Seat-map configuration')).toBeInTheDocument();
    expect(
      screen.getByText('No seat-map configuration has been prepared for this aircraft yet.'),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Seat-map cabins')).not.toBeInTheDocument();
  });

  it('renders seat-map notes when provided', () => {
    const withNotes: AdminAircraft = {
      ...aircraft,
      seatMapConfig: {
        ...aircraft.seatMapConfig!,
        notes: 'Exit rows marked for crew briefing.',
      },
    };

    renderWithProviders(
      <AircraftDetailsDialog open aircraft={withNotes} onClose={jest.fn()} />,
    );

    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Exit rows marked for crew briefing.')).toBeInTheDocument();
  });
});
