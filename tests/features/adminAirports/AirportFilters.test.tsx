import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AirportFilters } from '@/features/adminAirports/components/AirportFilters';
import {
  EMPTY_ADMIN_AIRPORT_FILTERS,
  type AdminAirportFilters,
} from '@/features/adminAirports';
import { renderWithProviders } from '@tests/utils/test-utils';

const filters: AdminAirportFilters = {
  search: 'KUL',
  country: 'Malaysia',
  active: 'active',
};

describe('AirportFilters', () => {
  it('renders the filter section with the current values', () => {
    renderWithProviders(<AirportFilters value={filters} onChange={jest.fn()} />);

    expect(screen.getByRole('region', { name: 'Airport filters' })).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toHaveValue('KUL');
    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveTextContent('Malaysia');
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Active');
  });

  it('updates search while preserving other filters', () => {
    const onChange = jest.fn();

    renderWithProviders(<AirportFilters value={filters} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'SZB' },
    });

    expect(onChange).toHaveBeenCalledWith({
      ...filters,
      search: 'SZB',
    });
  });

  it('updates country while preserving other filters', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();

    renderWithProviders(<AirportFilters value={filters} onChange={onChange} />);

    await user.click(screen.getByRole('combobox', { name: 'Country' }));
    await user.click(await screen.findByRole('option', { name: 'Singapore' }));

    expect(onChange).toHaveBeenCalledWith({
      ...filters,
      country: 'Singapore',
    });
  });

  it('updates status while preserving other filters', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();

    renderWithProviders(<AirportFilters value={filters} onChange={onChange} />);

    await user.click(screen.getByRole('combobox', { name: 'Status' }));
    await user.click(await screen.findByRole('option', { name: 'Inactive' }));

    expect(onChange).toHaveBeenCalledWith({
      ...filters,
      active: 'inactive',
    });
  });

  it('clears all filters', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = jest.fn();

    renderWithProviders(<AirportFilters value={filters} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_ADMIN_AIRPORT_FILTERS });
  });
});
