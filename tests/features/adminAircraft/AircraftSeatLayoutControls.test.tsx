import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AircraftSeatLayoutControls } from '@/features/adminAircraft/components/seatMap/AircraftSeatLayoutControls';
import type { AircraftSeatLayoutControlsProps } from '@/features/adminAircraft/components/seatMap/AircraftSeatLayoutControls';
import { renderWithProviders } from '@tests/utils/test-utils';

function renderControls(overrides: Partial<AircraftSeatLayoutControlsProps> = {}) {
  const props: AircraftSeatLayoutControlsProps = {
    rows: 30,
    columns: ['A', 'B', 'C', '|', 'D', 'E', 'F'],
    paintType: '',
    defaultCabinClass: 'ECONOMY',
    onRowsChange: jest.fn(),
    onColumnsChange: jest.fn(),
    onPaintTypeChange: jest.fn(),
    onDefaultCabinClassChange: jest.fn(),
    onApplyLayout: jest.fn(),
    onResetLayout: jest.fn(),
    ...overrides,
  };

  renderWithProviders(<AircraftSeatLayoutControls {...props} />);
  return props;
}

async function chooseSelectOption(
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp,
  optionName: RegExp | string,
) {
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name: optionName }));
}

describe('AircraftSeatLayoutControls', () => {
  it('renders layout fields and actions', () => {
    renderControls({ paintType: 'PREMIUM', defaultCabinClass: 'BUSINESS' });

    const section = screen.getByRole('region', { name: 'Seat map layout controls' });
    expect(section).toHaveTextContent('Layout');
    expect(screen.getByLabelText('Rows')).toHaveValue(30);
    expect(screen.getByLabelText('Columns')).toHaveValue('A B C | D E F');
    expect(screen.getByText(/Letters with optional aisle markers/i)).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /^Default cabin class$/i }),
    ).toHaveTextContent(/Business/i);
    expect(screen.getByRole('combobox', { name: /^Paint seat type$/i })).toHaveTextContent(
      /Premium/i,
    );
    expect(screen.getByText(/Optional: click seats to apply this type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply layout' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reset to cabin defaults' }),
    ).toBeInTheDocument();
  });

  it('notifies on rows change with parsed numbers', () => {
    const { onRowsChange } = renderControls();

    fireEvent.change(screen.getByLabelText('Rows'), { target: { value: '12' } });
    expect(onRowsChange).toHaveBeenLastCalledWith(12);
  });

  it('falls back to 1 when rows input is empty or non-numeric', () => {
    const { onRowsChange } = renderControls();

    fireEvent.change(screen.getByLabelText('Rows'), { target: { value: '' } });
    expect(onRowsChange).toHaveBeenLastCalledWith(1);

    fireEvent.change(screen.getByLabelText('Rows'), { target: { value: '0' } });
    expect(onRowsChange).toHaveBeenLastCalledWith(1);

    fireEvent.change(screen.getByLabelText('Rows'), { target: { value: 'abc' } });
    expect(onRowsChange).toHaveBeenLastCalledWith(1);
  });

  it('notifies on columns change', () => {
    const { onColumnsChange } = renderControls();

    fireEvent.change(screen.getByLabelText('Columns'), {
      target: { value: 'A | F' },
    });
    expect(onColumnsChange).toHaveBeenCalledWith('A | F');
  });

  it('notifies on default cabin class change', async () => {
    const user = userEvent.setup({ delay: null });
    const { onDefaultCabinClassChange } = renderControls();

    await chooseSelectOption(user, /^Default cabin class$/i, /First/i);
    expect(onDefaultCabinClassChange).toHaveBeenCalledWith('FIRST');
  });

  it('notifies on paint seat type change including clear selection', async () => {
    const user = userEvent.setup({ delay: null });
    const { onPaintTypeChange } = renderControls({ paintType: 'STANDARD' });

    await chooseSelectOption(user, /^Paint seat type$/i, /Extra legroom/i);
    expect(onPaintTypeChange).toHaveBeenCalledWith('EXTRA_LEGROOM');

    await chooseSelectOption(user, /^Paint seat type$/i, /Select seats to edit/i);
    expect(onPaintTypeChange).toHaveBeenCalledWith('');
  });

  it('invokes apply and reset actions', () => {
    const { onApplyLayout, onResetLayout } = renderControls();

    fireEvent.click(screen.getByRole('button', { name: 'Apply layout' }));
    expect(onApplyLayout).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Reset to cabin defaults' }));
    expect(onResetLayout).toHaveBeenCalledTimes(1);
  });
});
