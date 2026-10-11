import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AircraftSeatCell } from '@/features/adminAircraft/components/seatMap/AircraftSeatCell';
import type { AircraftConfiguredSeat } from '@/features/adminAircraft';
import { renderWithProviders } from '@tests/utils/test-utils';

function makeSeat(overrides: Partial<AircraftConfiguredSeat> = {}): AircraftConfiguredSeat {
  return {
    id: 'seat-12A',
    row: 12,
    column: 'A',
    label: '12A',
    cabinClass: 'ECONOMY',
    seatType: 'STANDARD',
    price: 25,
    emergencyExit: false,
    disabled: false,
    ...overrides,
  };
}

describe('AircraftSeatCell', () => {
  it('renders the column letter and base accessible name', () => {
    renderWithProviders(
      <AircraftSeatCell seat={makeSeat()} onSelect={jest.fn()} />,
    );

    const button = screen.getByRole('button', {
      name: /Configure seat 12A, Standard, ECONOMY/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-seat-id', 'seat-12A');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveTextContent('A');
  });

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const onSelect = jest.fn();
    const seat = makeSeat();

    renderWithProviders(<AircraftSeatCell seat={seat} onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: /Configure seat 12A/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('seat-12A');
  });

  it('calls onSelect for Enter and Space, but not for other keys', async () => {
    const user = userEvent.setup({ delay: null });
    const onSelect = jest.fn();

    renderWithProviders(<AircraftSeatCell seat={makeSeat()} onSelect={onSelect} />);

    const button = screen.getByRole('button', { name: /Configure seat 12A/i });
    await user.click(button);
    expect(onSelect).toHaveBeenCalledTimes(1);

    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenLastCalledWith('seat-12A');

    await user.keyboard(' ');
    expect(onSelect).toHaveBeenCalledTimes(3);

    await user.keyboard('{ArrowRight}');
    expect(onSelect).toHaveBeenCalledTimes(3);
  });

  it('marks the seat as selected in aria attributes and label', () => {
    renderWithProviders(
      <AircraftSeatCell seat={makeSeat()} selected onSelect={jest.fn()} />,
    );

    const button = screen.getByRole('button', {
      name: /Configure seat 12A, Standard, ECONOMY, Selected/i,
    });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('includes emergency exit and disabled flags in the accessible name', () => {
    renderWithProviders(
      <AircraftSeatCell
        seat={makeSeat({
          seatType: 'EMERGENCY_EXIT',
          emergencyExit: true,
          disabled: true,
          price: 40,
        })}
        onSelect={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: /Configure seat 12A, Emergency exit, ECONOMY, Emergency exit, Disabled/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders premium seat type labels in the accessible name', () => {
    renderWithProviders(
      <AircraftSeatCell
        seat={makeSeat({
          seatType: 'PREMIUM',
          cabinClass: 'BUSINESS',
          label: '3C',
          column: 'C',
          id: 'seat-3C',
        })}
        onSelect={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: /Configure seat 3C, Premium, BUSINESS/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('C');
  });

  it('shows a tooltip with seat details on hover', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <AircraftSeatCell
        seat={makeSeat({
          seatType: 'EXTRA_LEGROOM',
          emergencyExit: true,
          disabled: true,
          price: 55,
        })}
        selected
        onSelect={jest.fn()}
      />,
    );

    await user.hover(screen.getByRole('button', { name: /Configure seat 12A/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('tooltip', {
          name: /12A · Extra legroom · ECONOMY · \$55 · Emergency exit · Disabled/i,
        }),
      ).toBeInTheDocument();
    });
  });

  it('renders unavailable seat type without emergency flags when unset', () => {
    renderWithProviders(
      <AircraftSeatCell
        seat={makeSeat({
          seatType: 'UNAVAILABLE',
          disabled: false,
          emergencyExit: false,
        })}
        onSelect={jest.fn()}
      />,
    );

    const button = screen.getByRole('button', {
      name: /^Configure seat 12A, Unavailable, ECONOMY$/i,
    });
    expect(button).toBeInTheDocument();
    expect(button.getAttribute('aria-label')).not.toMatch(/Emergency exit|Disabled|Selected/);
  });
});
