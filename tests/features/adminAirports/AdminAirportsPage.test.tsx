import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryClient } from '@/app/providers/queryClient';
import {
  adminAirportKeys,
  adminAirportsApi,
  createSeedAdminAirports,
  mockAdminAirportsApi,
} from '@/features/adminAirports';
import { AdminAirportsPage } from '@/pages/admin/AdminAirportsPage';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AdminAirportsPage', () => {
  beforeEach(() => {
    mockAdminAirportsApi.reset();
    queryClient.clear();
    queryClient.removeQueries({ queryKey: adminAirportKeys.all });
    jest.restoreAllMocks();
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

  it('shows an error state and retries the airports query', async () => {
    const user = userEvent.setup({ delay: null });
    const listAirports = jest
      .spyOn(adminAirportsApi, 'listAirports')
      .mockRejectedValue(new Error('boom'));

    renderWithProviders(<AdminAirportsPage />, {
      initialEntries: ['/admin/airports'],
    });

    expect(
      await screen.findByText('Unable to load airports', {}, { timeout: 3000 }),
    ).toBeInTheDocument();

    listAirports.mockResolvedValue(createSeedAdminAirports());
    await user.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText('KUL')).toBeInTheDocument();
    });
  });

  it('shows empty state and opens create dialog from it', async () => {
    const user = userEvent.setup({ delay: null });
    jest.spyOn(adminAirportsApi, 'listAirports').mockResolvedValue([]);

    renderWithProviders(<AdminAirportsPage />, {
      initialEntries: ['/admin/airports'],
    });

    expect(await screen.findByText('No airports found')).toBeInTheDocument();
    expect(screen.getByText('0 airports')).toBeInTheDocument();

    const emptyState = screen.getByText('No airports found').closest('[role="status"]');
    expect(emptyState).not.toBeNull();
    await user.click(within(emptyState as HTMLElement).getByRole('button', { name: 'Create airport' }));
    expect(await screen.findByRole('heading', { name: 'Create airport' })).toBeInTheDocument();
  });

  it('shows singular airport count for one result', async () => {
    const [airport] = createSeedAdminAirports();
    jest.spyOn(adminAirportsApi, 'listAirports').mockResolvedValue([airport!]);

    renderWithProviders(<AdminAirportsPage />, {
      initialEntries: ['/admin/airports'],
    });

    expect(await screen.findByText('1 airport')).toBeInTheDocument();
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

    fireEvent.click(within(dialog).getByRole('button', { name: 'Create airport' }));

    await waitFor(() => {
      expect(
        mockAdminAirportsApi.getState().some((airport) => airport.code === 'AAA'),
      ).toBe(true);
    });
    expect(await screen.findByText('AAA')).toBeInTheDocument();
  });

  it(
    'edits an airport and can cancel the dialog',
    async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(<AdminAirportsPage />, {
        initialEntries: ['/admin/airports'],
      });

      await screen.findByText('KUL');
      await user.click(screen.getByRole('button', { name: 'Edit KUL' }));

      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByRole('heading', { name: 'Edit KUL' })).toBeInTheDocument();

      fireEvent.change(within(dialog).getByLabelText(/^City/i), {
        target: { value: 'KL City' },
      });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(
          mockAdminAirportsApi.getState().find((airport) => airport.code === 'KUL')?.city,
        ).toBe('KL City');
      });
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'Edit KUL' })).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Edit KUL' }));
      const reopen = await screen.findByRole('dialog');
      expect(within(reopen).getByRole('heading', { name: 'Edit KUL' })).toBeInTheDocument();
      fireEvent.click(within(reopen).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'Edit KUL' })).not.toBeInTheDocument();
      });
    },
    15_000,
  );

  it('shows create errors and dismisses the alert', async () => {
    const user = userEvent.setup({ delay: null });
    jest
      .spyOn(adminAirportsApi, 'createAirport')
      .mockRejectedValue(new Error('An airport with this code already exists'));

    renderWithProviders(<AdminAirportsPage />, {
      initialEntries: ['/admin/airports'],
    });

    await screen.findByText('KUL');
    await user.click(screen.getByRole('button', { name: 'Create airport' }));
    const dialog = await screen.findByRole('dialog');

    fireEvent.change(within(dialog).getByPlaceholderText('KUL'), {
      target: { value: 'BBB' },
    });
    fireEvent.change(
      within(dialog).getByPlaceholderText('Kuala Lumpur International Airport'),
      { target: { value: 'Beta Airport' } },
    );
    fireEvent.change(within(dialog).getByPlaceholderText('Kuala Lumpur'), {
      target: { value: 'Beta City' },
    });
    fireEvent.change(within(dialog).getByPlaceholderText('Malaysia'), {
      target: { value: 'Malaysia' },
    });
    fireEvent.change(within(dialog).getByPlaceholderText('Asia/Kuala_Lumpur'), {
      target: { value: 'Asia/Kuala_Lumpur' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^Terminals/i), {
      target: { value: '1' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^Latitude/i), {
      target: { value: '1' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^Longitude/i), {
      target: { value: '1' },
    });

    fireEvent.click(within(dialog).getByRole('button', { name: 'Create airport' }));

    expect(
      await screen.findByText('An airport with this code already exists'),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Create airport' })).not.toBeInTheDocument();
    });

    const alert = screen.getByRole('alert');
    fireEvent.click(within(alert).getByRole('button', { name: /close/i }));
    await waitFor(() => {
      expect(
        screen.queryByText('An airport with this code already exists'),
      ).not.toBeInTheDocument();
    });
  });

  it('shows a fallback save error when the failure is not an Error', async () => {
    const user = userEvent.setup({ delay: null });
    jest.spyOn(adminAirportsApi, 'createAirport').mockRejectedValue('nope');

    renderWithProviders(<AdminAirportsPage />, {
      initialEntries: ['/admin/airports'],
    });

    await screen.findByText('KUL');
    await user.click(screen.getByRole('button', { name: 'Create airport' }));
    const dialog = await screen.findByRole('dialog');

    fireEvent.change(within(dialog).getByPlaceholderText('KUL'), {
      target: { value: 'CCC' },
    });
    fireEvent.change(
      within(dialog).getByPlaceholderText('Kuala Lumpur International Airport'),
      { target: { value: 'Gamma Airport' } },
    );
    fireEvent.change(within(dialog).getByPlaceholderText('Kuala Lumpur'), {
      target: { value: 'Gamma City' },
    });
    fireEvent.change(within(dialog).getByPlaceholderText('Malaysia'), {
      target: { value: 'Malaysia' },
    });
    fireEvent.change(within(dialog).getByPlaceholderText('Asia/Kuala_Lumpur'), {
      target: { value: 'Asia/Kuala_Lumpur' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^Terminals/i), {
      target: { value: '1' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^Latitude/i), {
      target: { value: '1' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^Longitude/i), {
      target: { value: '1' },
    });

    await user.click(within(dialog).getByRole('button', { name: 'Create airport' }));

    expect(
      await screen.findByText('Unable to save the airport. Please try again.'),
    ).toBeInTheDocument();
  });

  it('shows toggle and delete errors and can cancel delete', async () => {
    const user = userEvent.setup({ delay: null });
    jest
      .spyOn(adminAirportsApi, 'setAirportActive')
      .mockRejectedValue(new Error('status failed'));
    const deleteSpy = jest
      .spyOn(adminAirportsApi, 'deleteAirport')
      .mockRejectedValueOnce(new Error('delete failed'));

    renderWithProviders(<AdminAirportsPage />, {
      initialEntries: ['/admin/airports'],
    });

    expect(await screen.findByText('SZB')).toBeInTheDocument();
    const row = screen.getByText('SZB').closest('tr');
    expect(row).not.toBeNull();

    fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Activate' }));
    expect(await screen.findByText('Unable to update status for SZB.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete SZB' }));
    let confirm = await screen.findByRole('dialog');
    fireEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Delete airport' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Delete SZB' }));
    confirm = await screen.findByRole('dialog');
    fireEvent.click(within(confirm).getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText('Unable to delete SZB.')).toBeInTheDocument();
    expect(deleteSpy).toHaveBeenCalled();
  });

  it('disables activate while the status update is pending', async () => {
    const user = userEvent.setup({ delay: null });
    const airport = createSeedAdminAirports().find((item) => item.code === 'SZB')!;
    let resolveActive!: (value: typeof airport) => void;
    jest.spyOn(adminAirportsApi, 'setAirportActive').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveActive = resolve;
        }),
    );

    renderWithProviders(<AdminAirportsPage />, {
      initialEntries: ['/admin/airports'],
    });

    expect(await screen.findByText('SZB')).toBeInTheDocument();
    const row = screen.getByText('SZB').closest('tr') as HTMLElement;
    const activate = within(row).getByRole('button', { name: 'Activate' });
    await user.click(activate);

    await waitFor(() => {
      expect(activate).toBeDisabled();
    });

    resolveActive({ ...airport, active: true });
    await waitFor(() => {
      expect(within(row).getByRole('button', { name: /Activate|Deactivate/i })).toBeEnabled();
    });
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
