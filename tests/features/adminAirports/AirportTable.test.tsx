import useMediaQuery from '@mui/material/useMediaQuery';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AirportTable } from '@/features/adminAirports/components/AirportTable';
import { createSeedAdminAirports, formatCoordinates } from '@/features/adminAirports';
import { renderWithProviders } from '@tests/utils/test-utils';

jest.mock('@mui/material/useMediaQuery', () => jest.fn());

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>;

describe('AirportTable', () => {
  const airports = createSeedAdminAirports().slice(0, 2);
  const activeAirport = { ...airports[0]!, active: true };
  const inactiveAirport = {
    ...airports[1]!,
    active: false,
    code: 'ZZZ',
    name: 'Inactive Test Airport',
  };

  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(true);
  });

  it('shows an empty filter message when there are no airports', () => {
    renderWithProviders(
      <AirportTable
        airports={[]}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onToggleActive={jest.fn()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('No airports match your filters.');
  });

  it('renders the desktop table with active and inactive airports', () => {
    renderWithProviders(
      <AirportTable
        airports={[activeAirport, inactiveAirport]}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onToggleActive={jest.fn()}
      />,
    );

    const table = screen.getByRole('table', { name: 'Admin airports' });
    expect(within(table).getByText(activeAirport.code)).toBeInTheDocument();
    expect(within(table).getByText(activeAirport.name)).toBeInTheDocument();
    expect(within(table).getByText(activeAirport.city)).toBeInTheDocument();
    expect(within(table).getByText(activeAirport.country)).toBeInTheDocument();
    expect(within(table).getByText(activeAirport.timezone)).toBeInTheDocument();
    expect(within(table).getByText(String(activeAirport.terminalCount))).toBeInTheDocument();
    expect(
      within(table).getByText(
        formatCoordinates(activeAirport.latitude, activeAirport.longitude),
      ),
    ).toBeInTheDocument();

    expect(within(table).getByText('Active')).toBeInTheDocument();
    expect(within(table).getByText('Inactive')).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'Activate' })).toBeInTheDocument();
  });

  it('invokes desktop edit, delete, and toggle handlers', async () => {
    const user = userEvent.setup({ delay: null });
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const onToggleActive = jest.fn();

    renderWithProviders(
      <AirportTable
        airports={[activeAirport]}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
      />,
    );

    await user.click(screen.getByRole('button', { name: `Edit ${activeAirport.code}` }));
    await user.click(screen.getByRole('button', { name: `Delete ${activeAirport.code}` }));
    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    expect(onEdit).toHaveBeenCalledWith(activeAirport);
    expect(onDelete).toHaveBeenCalledWith(activeAirport);
    expect(onToggleActive).toHaveBeenCalledWith(activeAirport);
  });

  it('disables the desktop toggle while that airport is updating', () => {
    renderWithProviders(
      <AirportTable
        airports={[activeAirport, inactiveAirport]}
        activeUpdatingId={activeAirport.id}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onToggleActive={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Activate' })).toBeEnabled();
  });

  it('renders mobile cards and wires card actions', async () => {
    mockUseMediaQuery.mockReturnValue(false);
    const user = userEvent.setup({ delay: null });
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const onToggleActive = jest.fn();

    renderWithProviders(
      <AirportTable
        airports={[activeAirport, inactiveAirport]}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
      />,
    );

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    const section = screen.getByRole('region', { name: 'Admin airports' });
    expect(within(section).getByText(activeAirport.code)).toBeInTheDocument();
    expect(within(section).getByText(activeAirport.name)).toBeInTheDocument();
    expect(within(section).getAllByText('City').length).toBeGreaterThan(0);
    expect(within(section).getAllByText('Country').length).toBeGreaterThan(0);
    expect(within(section).getAllByText('Timezone').length).toBeGreaterThan(0);
    expect(within(section).getAllByText('Terminals').length).toBeGreaterThan(0);
    expect(within(section).getAllByText('Coordinates').length).toBeGreaterThan(0);
    expect(within(section).getAllByText('Status').length).toBeGreaterThan(0);
    expect(
      within(section).getByText(
        formatCoordinates(activeAirport.latitude, activeAirport.longitude),
      ),
    ).toBeInTheDocument();
    expect(within(section).getByText('Active')).toBeInTheDocument();
    expect(within(section).getByText('Inactive')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: `Edit ${activeAirport.code}` }));
    await user.click(screen.getByRole('button', { name: `Delete ${inactiveAirport.code}` }));
    await user.click(screen.getByRole('button', { name: 'Deactivate' }));
    await user.click(screen.getByRole('button', { name: 'Activate' }));

    expect(onEdit).toHaveBeenCalledWith(activeAirport);
    expect(onDelete).toHaveBeenCalledWith(inactiveAirport);
    expect(onToggleActive).toHaveBeenCalledWith(activeAirport);
    expect(onToggleActive).toHaveBeenCalledWith(inactiveAirport);
  });

  it('disables the mobile toggle while that airport is updating', () => {
    mockUseMediaQuery.mockReturnValue(false);

    renderWithProviders(
      <AirportTable
        airports={[activeAirport]}
        activeUpdatingId={activeAirport.id}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onToggleActive={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeDisabled();
  });
});
