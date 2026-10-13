import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AircraftSeatInspector } from '@/features/adminAircraft/components/seatMap/AircraftSeatInspector';
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

async function chooseSelectOption(
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp,
  optionName: RegExp,
) {
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name: optionName }));
}

describe('AircraftSeatInspector', () => {
  it('shows an empty-state prompt when no seat is selected', () => {
    renderWithProviders(<AircraftSeatInspector seat={null} onChange={jest.fn()} />);

    const section = screen.getByRole('region', { name: 'Selected seat' });
    expect(section).toHaveTextContent('Selected seat');
    expect(section).toHaveTextContent(
      'Click a seat on the map to edit its label, cabin class, type, price, and flags.',
    );
    expect(screen.queryByLabelText(/^Seat label$/i)).not.toBeInTheDocument();
  });

  it('renders selected seat fields', () => {
    renderWithProviders(<AircraftSeatInspector seat={makeSeat()} onChange={jest.fn()} />);

    expect(screen.getByText('Selected seat · 12A')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Seat label$/i)).toHaveValue('12A');
    expect(screen.getByLabelText(/^Row$/i)).toHaveValue(12);
    expect(screen.getByLabelText(/^Column$/i)).toHaveValue('A');
    expect(screen.getByRole('combobox', { name: /^Cabin class$/i })).toHaveTextContent(/Economy/i);
    expect(screen.getByRole('combobox', { name: /^Seat type$/i })).toHaveTextContent(/Standard/i);
    expect(screen.getByLabelText(/^Price$/i)).toHaveValue(25);
    expect(screen.getByRole('switch', { name: 'Emergency exit' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Disabled seat' })).not.toBeChecked();
  });

  it('uppercases label and column updates', () => {
    const onChange = jest.fn();
    const seat = makeSeat();

    renderWithProviders(<AircraftSeatInspector seat={seat} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/^Seat label$/i), {
      target: { value: '12b' },
    });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'seat-12A', label: '12B' }),
    );

    fireEvent.change(screen.getByLabelText(/^Column$/i), {
      target: { value: 'cd' },
    });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ column: 'C' }));
  });

  it('parses row and price numbers and falls back for invalid values', () => {
    const onChange = jest.fn();

    renderWithProviders(<AircraftSeatInspector seat={makeSeat()} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/^Row$/i), {
      target: { value: '18' },
    });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ row: 18 }));

    fireEvent.change(screen.getByLabelText(/^Row$/i), {
      target: { value: '' },
    });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ row: 1 }));

    fireEvent.change(screen.getByLabelText(/^Price$/i), {
      target: { value: '42' },
    });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ price: 42 }));

    fireEvent.change(screen.getByLabelText(/^Price$/i), {
      target: { value: '' },
    });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ price: 0 }));
  });

  it('updates cabin class from the select', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();

    renderWithProviders(<AircraftSeatInspector seat={makeSeat()} onChange={onChange} />);

    await chooseSelectOption(user, /^Cabin class$/i, /^Business$/i);

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ cabinClass: 'BUSINESS' }));
  });

  it('sets emergencyExit when seat type becomes Emergency exit', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();

    renderWithProviders(<AircraftSeatInspector seat={makeSeat()} onChange={onChange} />);

    await chooseSelectOption(user, /^Seat type$/i, /^Emergency exit$/i);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        seatType: 'EMERGENCY_EXIT',
        emergencyExit: true,
      }),
    );
  });

  it('sets disabled when seat type becomes Unavailable', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();

    renderWithProviders(<AircraftSeatInspector seat={makeSeat()} onChange={onChange} />);

    await chooseSelectOption(user, /^Seat type$/i, /^Unavailable$/i);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        seatType: 'UNAVAILABLE',
        disabled: true,
      }),
    );
  });

  it('promotes STANDARD to EMERGENCY_EXIT when the emergency switch is enabled', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();

    renderWithProviders(<AircraftSeatInspector seat={makeSeat()} onChange={onChange} />);

    await user.click(screen.getByRole('switch', { name: 'Emergency exit' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        emergencyExit: true,
        seatType: 'EMERGENCY_EXIT',
      }),
    );
  });

  it('promotes STANDARD to UNAVAILABLE when the disabled switch is enabled', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();

    renderWithProviders(<AircraftSeatInspector seat={makeSeat()} onChange={onChange} />);

    await user.click(screen.getByRole('switch', { name: 'Disabled seat' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: true,
        seatType: 'UNAVAILABLE',
      }),
    );
  });

  it('demotes EMERGENCY_EXIT to STANDARD when emergency exit is turned off', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();

    renderWithProviders(
      <AircraftSeatInspector
        seat={makeSeat({ seatType: 'EMERGENCY_EXIT', emergencyExit: true })}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('switch', { name: 'Emergency exit' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        emergencyExit: false,
        seatType: 'STANDARD',
      }),
    );
  });

  it('demotes UNAVAILABLE to STANDARD when disabled is turned off', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();

    renderWithProviders(
      <AircraftSeatInspector
        seat={makeSeat({ seatType: 'UNAVAILABLE', disabled: true })}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('switch', { name: 'Disabled seat' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: false,
        seatType: 'STANDARD',
      }),
    );
  });

  it('does not force seat type when toggling flags on a non-standard seat', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();

    renderWithProviders(
      <AircraftSeatInspector
        seat={makeSeat({
          seatType: 'PREMIUM',
          emergencyExit: false,
          disabled: false,
        })}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('switch', { name: 'Emergency exit' }));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        seatType: 'PREMIUM',
        emergencyExit: true,
      }),
    );

    await user.click(screen.getByRole('switch', { name: 'Disabled seat' }));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        seatType: 'PREMIUM',
        disabled: true,
      }),
    );
  });

  it('keeps premium seat type when selected from the dropdown', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();

    renderWithProviders(<AircraftSeatInspector seat={makeSeat()} onChange={onChange} />);

    await chooseSelectOption(user, /^Seat type$/i, /^Premium$/i);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        seatType: 'PREMIUM',
        emergencyExit: false,
        disabled: false,
      }),
    );
  });
});
