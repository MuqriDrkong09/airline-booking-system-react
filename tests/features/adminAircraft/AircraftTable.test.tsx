import useMediaQuery from '@mui/material/useMediaQuery';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AircraftTable,
  createSeedAdminAircraft,
  formatAircraftLabel,
  formatSeatBreakdown,
} from '@/features/adminAircraft';
import { renderWithProviders } from '@tests/utils/test-utils';

jest.mock('@mui/material/useMediaQuery', () => jest.fn());

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>;

const defaultHandlers = {
  onView: jest.fn(),
  onEdit: jest.fn(),
  onConfigureSeats: jest.fn(),
  onDelete: jest.fn(),
  onToggleActive: jest.fn(),
};

describe('AircraftTable', () => {
  const seed = createSeedAdminAircraft();
  const activeAircraft = seed.find((item) => item.active)!;
  const inactiveAircraft = seed.find((item) => !item.active)!;

  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(true);
    Object.values(defaultHandlers).forEach((handler) => handler.mockClear());
  });

  it('shows an empty filter message when there are no aircraft', () => {
    renderWithProviders(
      <AircraftTable aircraftList={[]} {...defaultHandlers} />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('No aircraft match your filters.');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders the desktop table with active and inactive aircraft', () => {
    renderWithProviders(
      <AircraftTable
        aircraftList={[activeAircraft, inactiveAircraft]}
        {...defaultHandlers}
      />,
    );

    const table = screen.getByRole('table', { name: 'Admin aircraft' });
    const activeRow = within(table).getByText(activeAircraft.registration).closest('tr');
    const inactiveRow = within(table).getByText(inactiveAircraft.registration).closest('tr');
    expect(activeRow).toBeTruthy();
    expect(inactiveRow).toBeTruthy();

    expect(within(activeRow as HTMLElement).getByText(activeAircraft.manufacturer)).toBeInTheDocument();
    expect(within(activeRow as HTMLElement).getByText(activeAircraft.model)).toBeInTheDocument();
    expect(
      within(activeRow as HTMLElement).getByText(String(activeAircraft.totalSeats)),
    ).toBeInTheDocument();
    expect(
      within(activeRow as HTMLElement).getByText(formatSeatBreakdown(activeAircraft)),
    ).toBeInTheDocument();
    expect(within(activeRow as HTMLElement).getByText('Active')).toBeInTheDocument();
    expect(within(activeRow as HTMLElement).getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();

    expect(within(inactiveRow as HTMLElement).getByText(inactiveAircraft.model)).toBeInTheDocument();
    expect(within(inactiveRow as HTMLElement).getByText('Inactive')).toBeInTheDocument();
    expect(within(inactiveRow as HTMLElement).getByRole('button', { name: 'Activate' })).toBeInTheDocument();
  });

  it('invokes desktop view, edit, configure seats, delete, and toggle handlers', async () => {
    const user = userEvent.setup({ delay: null });
    const onView = jest.fn();
    const onEdit = jest.fn();
    const onConfigureSeats = jest.fn();
    const onDelete = jest.fn();
    const onToggleActive = jest.fn();

    renderWithProviders(
      <AircraftTable
        aircraftList={[activeAircraft]}
        onView={onView}
        onEdit={onEdit}
        onConfigureSeats={onConfigureSeats}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: `View ${activeAircraft.registration}` }),
    );
    await user.click(
      screen.getByRole('button', {
        name: `Configure seats ${activeAircraft.registration}`,
      }),
    );
    await user.click(
      screen.getByRole('button', { name: `Edit ${activeAircraft.registration}` }),
    );
    await user.click(
      screen.getByRole('button', { name: `Delete ${activeAircraft.registration}` }),
    );
    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    expect(onView).toHaveBeenCalledWith(activeAircraft);
    expect(onConfigureSeats).toHaveBeenCalledWith(activeAircraft);
    expect(onEdit).toHaveBeenCalledWith(activeAircraft);
    expect(onDelete).toHaveBeenCalledWith(activeAircraft);
    expect(onToggleActive).toHaveBeenCalledWith(activeAircraft);
  });

  it('activates an inactive aircraft from the desktop table', async () => {
    const user = userEvent.setup({ delay: null });
    const onToggleActive = jest.fn();

    renderWithProviders(
      <AircraftTable
        aircraftList={[inactiveAircraft]}
        {...defaultHandlers}
        onToggleActive={onToggleActive}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Activate' }));
    expect(onToggleActive).toHaveBeenCalledWith(inactiveAircraft);
  });

  it('disables the desktop toggle while that aircraft is updating', () => {
    renderWithProviders(
      <AircraftTable
        aircraftList={[activeAircraft, inactiveAircraft]}
        activeUpdatingId={activeAircraft.id}
        {...defaultHandlers}
      />,
    );

    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Activate' })).toBeEnabled();
  });

  it('renders mobile cards with details and wires card actions', async () => {
    mockUseMediaQuery.mockReturnValue(false);
    const user = userEvent.setup({ delay: null });
    const onView = jest.fn();
    const onEdit = jest.fn();
    const onConfigureSeats = jest.fn();
    const onDelete = jest.fn();
    const onToggleActive = jest.fn();

    renderWithProviders(
      <AircraftTable
        aircraftList={[activeAircraft, inactiveAircraft]}
        onView={onView}
        onEdit={onEdit}
        onConfigureSeats={onConfigureSeats}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
      />,
    );

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    const section = screen.getByRole('region', { name: 'Admin aircraft' });

    expect(within(section).getByText(activeAircraft.registration)).toBeInTheDocument();
    expect(
      within(section).getByText(formatAircraftLabel(activeAircraft)),
    ).toBeInTheDocument();
    expect(within(section).getAllByText('Manufacturer').length).toBeGreaterThan(0);
    expect(within(section).getAllByText('Model').length).toBeGreaterThan(0);
    expect(within(section).getAllByText('Total seats').length).toBeGreaterThan(0);
    expect(within(section).getAllByText('Cabins').length).toBeGreaterThan(0);
    expect(within(section).getAllByText('Status').length).toBeGreaterThan(0);
    expect(within(section).getByText(formatSeatBreakdown(activeAircraft))).toBeInTheDocument();
    expect(within(section).getByText('Active')).toBeInTheDocument();
    expect(within(section).getByText('Inactive')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: `View ${activeAircraft.registration}` }),
    );
    await user.click(
      screen.getByRole('button', {
        name: `Configure seats ${activeAircraft.registration}`,
      }),
    );
    await user.click(
      screen.getByRole('button', { name: `Edit ${activeAircraft.registration}` }),
    );
    await user.click(
      screen.getByRole('button', { name: `Delete ${inactiveAircraft.registration}` }),
    );
    await user.click(screen.getByRole('button', { name: 'Deactivate' }));
    await user.click(screen.getByRole('button', { name: 'Activate' }));

    expect(onView).toHaveBeenCalledWith(activeAircraft);
    expect(onConfigureSeats).toHaveBeenCalledWith(activeAircraft);
    expect(onEdit).toHaveBeenCalledWith(activeAircraft);
    expect(onDelete).toHaveBeenCalledWith(inactiveAircraft);
    expect(onToggleActive).toHaveBeenCalledWith(activeAircraft);
    expect(onToggleActive).toHaveBeenCalledWith(inactiveAircraft);
  });

  it('disables the mobile toggle while that aircraft is updating', () => {
    mockUseMediaQuery.mockReturnValue(false);

    renderWithProviders(
      <AircraftTable
        aircraftList={[activeAircraft]}
        activeUpdatingId={activeAircraft.id}
        {...defaultHandlers}
      />,
    );

    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeDisabled();
  });
});
