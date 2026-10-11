import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ZodError, ZodIssueCode } from 'zod';
import { AircraftSeatMapEditor } from '@/features/adminAircraft/components/seatMap/AircraftSeatMapEditor';
import type {
  AdminAircraft,
  AircraftConfiguredSeat,
  AircraftSeatMapConfig,
} from '@/features/adminAircraft';
import * as seatMapConfig from '@/features/adminAircraft/utils/seatMapConfig';
import { renderWithProviders } from '@tests/utils/test-utils';

function makeSeat(overrides: Partial<AircraftConfiguredSeat> = {}): AircraftConfiguredSeat {
  return {
    id: 'seat-1-A',
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
    layoutKey: 'Test T1',
    rows: 2,
    columns: ['A', 'B'],
    cabins: [
      {
        cabinClass: 'ECONOMY',
        seatCount: 4,
        columns: ['A', 'B'],
        startRow: 1,
        rowCount: 2,
      },
    ],
    seats: [
      makeSeat({ id: 'seat-1-A', row: 1, column: 'A', label: '1A' }),
      makeSeat({ id: 'seat-1-B', row: 1, column: 'B', label: '1B' }),
      makeSeat({ id: 'seat-2-A', row: 2, column: 'A', label: '2A' }),
      makeSeat({ id: 'seat-2-B', row: 2, column: 'B', label: '2B' }),
    ],
    version: 1,
    ...overrides,
  };
}

function makeAircraft(overrides: Partial<AdminAircraft> = {}): AdminAircraft {
  return {
    id: 'aircraft-test-1',
    manufacturer: 'Test',
    model: 'T1',
    registration: '9M-TEST',
    totalSeats: 4,
    economySeats: 4,
    premiumEconomySeats: 0,
    businessSeats: 0,
    firstClassSeats: 0,
    active: true,
    seatMapConfig: makeConfig(),
    ...overrides,
  };
}

async function chooseSelectOption(
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp,
  optionName: RegExp | string,
) {
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name: optionName }));
  await waitFor(() => {
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
}

describe('AircraftSeatMapEditor', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders summary, legend, canvas, and selects the first seat', () => {
    renderWithProviders(
      <AircraftSeatMapEditor aircraft={makeAircraft()} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    expect(screen.getByText(/4 seats · 2 rows · version 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Seat type legend')).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: /Test T1 seat map editor/i })).toBeInTheDocument();
    expect(screen.getByText(/Selected seat · 1A/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Configure seat 1A, Standard, ECONOMY, Selected/i }),
    ).toBeInTheDocument();
  });

  it('starts with no selection when the config has no seats', () => {
    renderWithProviders(
      <AircraftSeatMapEditor
        aircraft={makeAircraft({
          seatMapConfig: makeConfig({
            seats: [],
            cabins: [],
            rows: 1,
            columns: ['A'],
          }),
        })}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(
      screen.getByText(/Click a seat on the map to edit/i),
    ).toBeInTheDocument();
  });

  it('resets editor state when the aircraft prop changes', () => {
    const first = makeAircraft();
    const second = makeAircraft({
      id: 'aircraft-test-2',
      model: 'T2',
      registration: '9M-TWO',
      seatMapConfig: makeConfig({
        layoutKey: 'Test T2',
        rows: 1,
        seats: [makeSeat({ id: 'seat-1-A', row: 1, column: 'A', label: '1A' })],
        version: 3,
      }),
    });

    const { rerender } = renderWithProviders(
      <AircraftSeatMapEditor aircraft={first} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    expect(screen.getByText(/4 seats · 2 rows · version 1/i)).toBeInTheDocument();

    rerender(
      <AircraftSeatMapEditor aircraft={second} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    expect(screen.getByText(/1 seats · 1 rows · version 3/i)).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: /Test T2 seat map editor/i })).toBeInTheDocument();
  });

  it('selects a seat without paint, and paints when a paint type is active', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <AircraftSeatMapEditor aircraft={makeAircraft()} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: /^Configure seat 2B\b/i }));
    expect(screen.getByText(/Selected seat · 2B/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Configure seat 2B, Standard, ECONOMY, Selected/i }),
    ).toBeInTheDocument();

    await chooseSelectOption(user, /^Paint seat type$/i, /Premium/i);
    await user.click(screen.getByRole('button', { name: /^Configure seat 1B\b/i }));

    expect(
      screen.getByRole('button', { name: /Configure seat 1B, Premium, ECONOMY, Selected/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /^Seat type$/i })).toHaveTextContent(/Premium/i);
  });

  it('updates the selected seat from the inspector', () => {
    renderWithProviders(
      <AircraftSeatMapEditor aircraft={makeAircraft()} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    fireEvent.change(screen.getByLabelText(/^Price$/i), { target: { value: '40' } });
    expect(screen.getByLabelText(/^Price$/i)).toHaveValue(40);
  });

  it('applies a new layout and keeps the selection when the seat still exists', () => {
    renderWithProviders(
      <AircraftSeatMapEditor aircraft={makeAircraft()} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^Configure seat 1B\b/i }));
    fireEvent.change(screen.getByLabelText('Rows'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Columns'), { target: { value: 'A B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply layout' }));

    expect(screen.getByText(/2 seats · 1 rows · version 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected seat · 1B/i)).toBeInTheDocument();
  });

  it('falls back to the first seat when apply layout removes the selection', () => {
    renderWithProviders(
      <AircraftSeatMapEditor aircraft={makeAircraft()} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^Configure seat 2B\b/i }));
    fireEvent.change(screen.getByLabelText('Rows'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Columns'), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply layout' }));

    expect(screen.getByText(/1 seats · 1 rows · version 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected seat · 1A/i)).toBeInTheDocument();
  });

  it('clears selection when apply layout yields no seats', () => {
    renderWithProviders(
      <AircraftSeatMapEditor aircraft={makeAircraft()} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    fireEvent.change(screen.getByLabelText('Columns'), { target: { value: '|' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply layout' }));

    expect(screen.getByText(/0 seats · 2 rows · version 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Click a seat on the map to edit/i)).toBeInTheDocument();
  });

  it('clamps and normalizes draft rows when applying layout', () => {
    renderWithProviders(
      <AircraftSeatMapEditor aircraft={makeAircraft()} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    fireEvent.change(screen.getByLabelText('Rows'), { target: { value: '2.9' } });
    fireEvent.change(screen.getByLabelText('Columns'), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply layout' }));
    expect(screen.getByText(/2 seats · 2 rows · version 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Rows')).toHaveValue(2);

    fireEvent.change(screen.getByLabelText('Rows'), { target: { value: '0.4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply layout' }));
    expect(screen.getByText(/1 seats · 1 rows · version 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Rows')).toHaveValue(1);

    fireEvent.change(screen.getByLabelText('Rows'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply layout' }));
    expect(screen.getByText(/80 seats · 80 rows · version 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Rows')).toHaveValue(80);
  });

  it('surfaces apply-layout Zod, Error, and unknown failures', () => {
    renderWithProviders(
      <AircraftSeatMapEditor aircraft={makeAircraft()} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    jest.spyOn(seatMapConfig, 'buildSeatsFromLayout').mockImplementationOnce(() => {
      throw new ZodError([
        { code: ZodIssueCode.custom, message: 'Issue one', path: [] },
        { code: ZodIssueCode.custom, message: 'Issue two', path: [] },
        { code: ZodIssueCode.custom, message: 'Issue three', path: [] },
        { code: ZodIssueCode.custom, message: 'Issue four', path: [] },
      ]);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply layout' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Issue one; Issue two; Issue three');

    fireEvent.click(within(screen.getByRole('alert')).getByRole('button'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    jest.spyOn(seatMapConfig, 'buildSeatsFromLayout').mockImplementationOnce(() => {
      throw new Error('layout exploded');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply layout' }));
    expect(screen.getByRole('alert')).toHaveTextContent('layout exploded');

    fireEvent.click(within(screen.getByRole('alert')).getByRole('button'));

    jest.spyOn(seatMapConfig, 'buildSeatsFromLayout').mockImplementationOnce(() => {
      throw 'not-an-error';
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply layout' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Seat map configuration is invalid.');
  });

  it('resets layout to cabin defaults and clears paint type', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <AircraftSeatMapEditor aircraft={makeAircraft()} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    await chooseSelectOption(user, /^Paint seat type$/i, /Premium/i);
    expect(screen.getByRole('combobox', { name: /^Paint seat type$/i })).toHaveTextContent(
      /Premium/i,
    );

    fireEvent.change(screen.getByLabelText('Rows'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Columns'), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply layout' }));
    expect(screen.getByText(/1 seats · 1 rows/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reset to cabin defaults' }));

    expect(screen.getByRole('combobox', { name: /^Paint seat type$/i })).not.toHaveTextContent(
      /Premium/i,
    );
    expect(screen.getByRole('grid', { name: /Test T1 seat map editor/i })).toBeInTheDocument();
    expect(screen.getByText(/Selected seat ·/i)).toBeInTheDocument();
  });

  it('clears selection when reset yields an empty seat map', () => {
    jest.spyOn(seatMapConfig, 'buildDefaultSeatMapConfig').mockReturnValueOnce(
      makeConfig({
        seats: [],
        cabins: [],
        rows: 1,
        columns: ['A'],
        version: 1,
      }),
    );

    renderWithProviders(
      <AircraftSeatMapEditor aircraft={makeAircraft()} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reset to cabin defaults' }));
    expect(screen.getByText(/Click a seat on the map to edit/i)).toBeInTheDocument();
  });

  it('saves a validated seat map and fills default notes when missing', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <AircraftSeatMapEditor
        aircraft={makeAircraft({
          seatMapConfig: makeConfig({ notes: undefined }),
        })}
        onSave={onSave}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save seat map' }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    const saved = onSave.mock.calls[0]![0] as AircraftSeatMapConfig;
    expect(saved.version).toBe(2);
    expect(saved.notes).toBe('Configured in admin seat-map editor.');
    expect(saved.seats.length).toBe(4);
  });

  it('keeps existing notes when saving', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <AircraftSeatMapEditor
        aircraft={makeAircraft({
          seatMapConfig: makeConfig({ notes: 'Keep me' }),
        })}
        onSave={onSave}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save seat map' }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Keep me', version: 2 }),
      );
    });
  });

  it('surfaces save Zod, Error, and unknown failures', async () => {
    renderWithProviders(
      <AircraftSeatMapEditor aircraft={makeAircraft()} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    jest.spyOn(seatMapConfig, 'validateSeatMapConfig').mockImplementationOnce(() => {
      throw new ZodError([
        { code: ZodIssueCode.custom, message: 'Save issue A', path: ['seats'] },
        { code: ZodIssueCode.custom, message: 'Save issue B', path: ['rows'] },
      ]);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save seat map' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Save issue A; Save issue B');

    fireEvent.click(within(screen.getByRole('alert')).getByRole('button'));

    jest.spyOn(seatMapConfig, 'validateSeatMapConfig').mockImplementationOnce(() => {
      throw new Error('save failed');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save seat map' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('save failed');

    fireEvent.click(within(screen.getByRole('alert')).getByRole('button'));

    jest.spyOn(seatMapConfig, 'validateSeatMapConfig').mockImplementationOnce(() => {
      throw 42;
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save seat map' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Seat map configuration is invalid.',
    );
  });

  it('shows a real validation error when saving an empty seat map', async () => {
    renderWithProviders(
      <AircraftSeatMapEditor aircraft={makeAircraft()} onSave={jest.fn()} onCancel={jest.fn()} />,
    );

    fireEvent.change(screen.getByLabelText('Columns'), { target: { value: '|' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply layout' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save seat map' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/at least one seat/i);
  });

  it('disables Back while saving and invokes onCancel when enabled', () => {
    const onCancel = jest.fn();
    const aircraft = makeAircraft();

    const { rerender } = renderWithProviders(
      <AircraftSeatMapEditor
        aircraft={aircraft}
        saving
        onSave={jest.fn()}
        onCancel={onCancel}
      />,
    );

    const back = screen.getByRole('button', { name: 'Back' });
    expect(back).toBeDisabled();
    fireEvent.click(back);
    expect(onCancel).not.toHaveBeenCalled();

    rerender(
      <AircraftSeatMapEditor aircraft={aircraft} onSave={jest.fn()} onCancel={onCancel} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

