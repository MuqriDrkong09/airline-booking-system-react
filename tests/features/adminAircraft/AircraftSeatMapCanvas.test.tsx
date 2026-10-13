import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AircraftSeatMapCanvas } from '@/features/adminAircraft/components/seatMap/AircraftSeatMapCanvas';
import type { AircraftConfiguredSeat, AircraftSeatMapConfig } from '@/features/adminAircraft';
import { renderWithProviders } from '@tests/utils/test-utils';

function makeSeat(overrides: Partial<AircraftConfiguredSeat> = {}): AircraftConfiguredSeat {
  return {
    id: 'seat-1A',
    row: 1,
    column: 'A',
    label: '1A',
    cabinClass: 'ECONOMY',
    seatType: 'STANDARD',
    price: 25,
    emergencyExit: false,
    disabled: false,
    ...overrides,
  };
}

function makeConfig(overrides: Partial<AircraftSeatMapConfig> = {}): AircraftSeatMapConfig {
  return {
    layoutKey: 'Airbus A320',
    rows: 2,
    columns: ['A', '|', 'B'],
    cabins: [],
    seats: [
      makeSeat({ id: 'seat-1A', row: 1, column: 'A', label: '1A', cabinClass: 'BUSINESS' }),
      makeSeat({ id: 'seat-1B', row: 1, column: 'B', label: '1B', cabinClass: 'BUSINESS' }),
      makeSeat({ id: 'seat-2A', row: 2, column: 'A', label: '2A', cabinClass: 'ECONOMY' }),
      makeSeat({ id: 'seat-2B', row: 2, column: 'B', label: '2B', cabinClass: 'ECONOMY' }),
    ],
    version: 1,
    ...overrides,
  };
}

describe('AircraftSeatMapCanvas', () => {
  it('renders the grid chrome, cabin headers, and seat cells', () => {
    renderWithProviders(
      <AircraftSeatMapCanvas
        config={makeConfig()}
        selectedSeatId={null}
        onSelectSeat={jest.fn()}
      />,
    );

    expect(screen.getByRole('grid', { name: 'Airbus A320 seat map editor' })).toBeInTheDocument();
    expect(screen.getByText('FRONT OF AIRCRAFT · Airbus A320')).toBeInTheDocument();
    expect(screen.getByText('REAR OF AIRCRAFT')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Economy')).toBeInTheDocument();
    expect(screen.getByRole('row', { name: 'Row 1' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: 'Row 2' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Configure seat 1A, Standard, BUSINESS/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Configure seat 2B, Standard, ECONOMY/i }),
    ).toBeInTheDocument();
  });

  it('shows a cabin header only when the cabin class changes', () => {
    renderWithProviders(
      <AircraftSeatMapCanvas
        config={makeConfig({
          rows: 3,
          seats: [
            makeSeat({ id: 'seat-1A', row: 1, column: 'A', label: '1A', cabinClass: 'ECONOMY' }),
            makeSeat({ id: 'seat-1B', row: 1, column: 'B', label: '1B', cabinClass: 'ECONOMY' }),
            makeSeat({ id: 'seat-2A', row: 2, column: 'A', label: '2A', cabinClass: 'ECONOMY' }),
            makeSeat({ id: 'seat-2B', row: 2, column: 'B', label: '2B', cabinClass: 'ECONOMY' }),
            makeSeat({
              id: 'seat-3A',
              row: 3,
              column: 'A',
              label: '3A',
              cabinClass: 'PREMIUM_ECONOMY',
            }),
            makeSeat({
              id: 'seat-3B',
              row: 3,
              column: 'B',
              label: '3B',
              cabinClass: 'PREMIUM_ECONOMY',
            }),
          ],
        })}
        selectedSeatId={null}
        onSelectSeat={jest.fn()}
      />,
    );

    expect(screen.getAllByText('Economy')).toHaveLength(1);
    expect(screen.getByText('Premium economy')).toBeInTheDocument();
  });

  it('renders empty placeholders when a column has no seat for a row', () => {
    renderWithProviders(
      <AircraftSeatMapCanvas
        config={makeConfig({
          rows: 1,
          columns: ['A', 'C'],
          seats: [makeSeat({ id: 'seat-1A', row: 1, column: 'A', label: '1A' })],
        })}
        selectedSeatId={null}
        onSelectSeat={jest.fn()}
      />,
    );

    const row = screen.getByRole('row', { name: 'Row 1' });
    expect(within(row).getByRole('button', { name: /Configure seat 1A/i })).toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: /Configure seat 1C/i })).toBeNull();
    expect(within(row).getAllByRole('button')).toHaveLength(1);
  });

  it('keeps aisle gaps and skips cabin headers for rows without seats', () => {
    const { container } = renderWithProviders(
      <AircraftSeatMapCanvas
        config={makeConfig({
          rows: 2,
          columns: ['A', '|', 'B'],
          seats: [
            makeSeat({ id: 'seat-2A', row: 2, column: 'A', label: '2A', cabinClass: 'FIRST' }),
            makeSeat({ id: 'seat-2B', row: 2, column: 'B', label: '2B', cabinClass: 'FIRST' }),
          ],
        })}
        selectedSeatId={null}
        onSelectSeat={jest.fn()}
      />,
    );

    expect(screen.getByRole('row', { name: 'Row 1' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('row', { name: 'Row 1' })).queryAllByRole('button'),
    ).toHaveLength(0);
    expect(screen.getByText('First class')).toBeInTheDocument();
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it('marks the selected seat and notifies onSelectSeat when a cell is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const onSelectSeat = jest.fn();

    renderWithProviders(
      <AircraftSeatMapCanvas
        config={makeConfig({ rows: 1, seats: [makeSeat()] })}
        selectedSeatId="seat-1A"
        onSelectSeat={onSelectSeat}
      />,
    );

    const selected = screen.getByRole('button', {
      name: /Configure seat 1A, Standard, ECONOMY, Selected/i,
    });
    expect(selected).toHaveAttribute('aria-pressed', 'true');

    await user.click(selected);
    expect(onSelectSeat).toHaveBeenCalledWith('seat-1A');
  });
});
