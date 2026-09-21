import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeatMap, SeatLegend, createAircraftSeatMap, groupSeatsIntoRows } from '@/features/seats';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('SeatMap', () => {
  it('renders cabin sections and selects seats via click and keyboard', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const map = createAircraftSeatMap('Airbus A320');
    const rows = groupSeatsIntoRows(map.seats);
    const available = map.seats.find((seat) => seat.status === 'AVAILABLE');

    expect(available).toBeDefined();

    renderWithProviders(
      <>
        <SeatLegend />
        <SeatMap
          aircraftModel={map.aircraftModel}
          rows={rows}
          getDisplayStatus={(seat) => seat.status}
          onSelect={onSelect}
        />
      </>,
    );

    expect(screen.getByLabelText('Seat legend')).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: /Airbus A320 seat map/i })).toBeInTheDocument();
    expect(screen.getByText('Economy')).toBeInTheDocument();
    expect(screen.getByText('First class')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Premium economy')).toBeInTheDocument();

    const seatButton = screen.getByRole('button', {
      name: new RegExp(`Seat ${available!.label}`, 'i'),
    });
    await user.click(seatButton);
    expect(onSelect).toHaveBeenCalledWith(available!.id);

    seatButton.focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('does not select occupied seats', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const map = createAircraftSeatMap();
    const rows = groupSeatsIntoRows(map.seats);
    const occupied = map.seats.find((seat) => seat.status === 'OCCUPIED');

    expect(occupied).toBeDefined();

    renderWithProviders(
      <SeatMap
        aircraftModel={map.aircraftModel}
        rows={rows}
        getDisplayStatus={(seat) => seat.status}
        onSelect={onSelect}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: new RegExp(`Seat ${occupied!.label}`, 'i') }),
    );
    expect(onSelect).not.toHaveBeenCalled();
  });
});
