import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryClient } from '@/app/providers/queryClient';
import {
  adminAirportKeys,
  mockAdminAirportsApi,
} from '@/features/adminAirports';
import { AdminAirportsPage } from '@/pages/admin/AdminAirportsPage';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AdminAirportsPage', () => {
  beforeEach(() => {
    mockAdminAirportsApi.reset();
    queryClient.removeQueries({ queryKey: adminAirportKeys.all });
  });

  it('lists airports and filters by search', async () => {
    renderWithProviders(<AdminAirportsPage />, {
      initialEntries: ['/admin/airports'],
    });

    expect(await screen.findByRole('heading', { name: 'Airports' })).toBeInTheDocument();
    expect(await screen.findByText('KUL')).toBeInTheDocument();
    expect(screen.getByText('SZB')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'SZB' },
    });

    await waitFor(() => {
      expect(screen.getByText('SZB')).toBeInTheDocument();
      expect(screen.queryByText('KUL')).not.toBeInTheDocument();
    });
  });

  it('creates an airport through the dialog form', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminAirportsPage />, {
      initialEntries: ['/admin/airports'],
    });

    await screen.findByText('KUL');
    await user.click(screen.getByRole('button', { name: 'Create airport' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Create airport' })).toBeInTheDocument();

    fireEvent.change(within(dialog).getByPlaceholderText('KUL'), {
      target: { value: 'AAA' },
    });
    fireEvent.change(
      within(dialog).getByPlaceholderText('Kuala Lumpur International Airport'),
      { target: { value: 'Alpha Test Airport' } },
    );
    fireEvent.change(within(dialog).getByPlaceholderText('Kuala Lumpur'), {
      target: { value: 'Alpha City' },
    });
    fireEvent.change(within(dialog).getByPlaceholderText('Malaysia'), {
      target: { value: 'Malaysia' },
    });
    fireEvent.change(within(dialog).getByPlaceholderText('Asia/Kuala_Lumpur'), {
      target: { value: 'Asia/Kuala_Lumpur' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^Terminals/i), {
      target: { value: '2' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^Latitude/i), {
      target: { value: '3.1' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^Longitude/i), {
      target: { value: '101.5' },
    });

    await user.click(within(dialog).getByRole('button', { name: 'Create airport' }));

    expect(await screen.findByText('AAA')).toBeInTheDocument();
  });

  it('toggles active status and deletes an airport with confirmation', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminAirportsPage />, {
      initialEntries: ['/admin/airports'],
    });

    expect(await screen.findByText('SZB')).toBeInTheDocument();

    const codeCell = screen.getByText('SZB');
    const row = codeCell.closest('tr');
    expect(row).not.toBeNull();

    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Activate' }));

    await waitFor(() => {
      expect(
        mockAdminAirportsApi.getState().find((airport) => airport.code === 'SZB')?.active,
      ).toBe(true);
    });

    await user.click(screen.getByRole('button', { name: 'Delete SZB' }));
    const confirm = await screen.findByRole('dialog');
    expect(within(confirm).getByText(/Delete SZB/i)).toBeInTheDocument();
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByText('SZB')).not.toBeInTheDocument();
    });
  });
});
