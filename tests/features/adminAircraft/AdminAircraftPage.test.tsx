import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryClient } from '@/app/providers/queryClient';
import {
  adminAircraftApi,
  adminAircraftKeys,
  createSeedAdminAircraft,
  mockAdminAircraftApi,
} from '@/features/adminAircraft';
import { AdminAircraftPage } from '@/pages/admin/AdminAircraftPage';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AdminAircraftPage', () => {
  beforeEach(() => {
    mockAdminAircraftApi.reset();
    queryClient.removeQueries({ queryKey: adminAircraftKeys.all });
    jest.restoreAllMocks();
  });

  it('lists aircraft and filters by search', async () => {
    renderWithProviders(<AdminAircraftPage />, {
      initialEntries: ['/admin/aircraft'],
    });

    expect(await screen.findByRole('heading', { name: 'Aircraft' })).toBeInTheDocument();
    expect(await screen.findByText('9M-AAA')).toBeInTheDocument();
    expect(screen.getByText('9M-AAZ')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'AAZ' },
    });

    await waitFor(() => {
      expect(screen.getByText('9M-AAZ')).toBeInTheDocument();
      expect(screen.queryByText('9M-AAA')).not.toBeInTheDocument();
    });
  });

  it('shows an error state and retries the aircraft query', async () => {
    const user = userEvent.setup({ delay: null });
    const listAircraft = jest
      .spyOn(adminAircraftApi, 'listAircraft')
      .mockRejectedValue(new Error('boom'));

    renderWithProviders(<AdminAircraftPage />, {
      initialEntries: ['/admin/aircraft'],
    });

    expect(
      await screen.findByText('Unable to load aircraft', {}, { timeout: 3000 }),
    ).toBeInTheDocument();

    listAircraft.mockResolvedValue(createSeedAdminAircraft());
    await user.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText('9M-AAA')).toBeInTheDocument();
    });
  });

  it('views aircraft details including seat-map configuration', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminAircraftPage />, {
      initialEntries: ['/admin/aircraft'],
    });

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'View 9M-AAA' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Seat-map configuration')).toBeInTheDocument();
    expect(within(dialog).getByText('Airbus A320')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Seat-map cabins')).toBeInTheDocument();
  });

  it('creates an aircraft through the dialog form', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminAircraftPage />, {
      initialEntries: ['/admin/aircraft'],
    });

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'Create aircraft' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Create aircraft' })).toBeInTheDocument();

    fireEvent.change(within(dialog).getByPlaceholderText('Airbus'), {
      target: { value: 'Embraer' },
    });
    fireEvent.change(within(dialog).getByPlaceholderText('A320'), {
      target: { value: 'E190' },
    });
    fireEvent.change(within(dialog).getByPlaceholderText('9M-AAA'), {
      target: { value: '9M-NEW' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^Total seats/i), {
      target: { value: '100' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^Economy seats/i), {
      target: { value: '96' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^Premium economy seats/i), {
      target: { value: '0' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^Business seats/i), {
      target: { value: '4' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^First class seats/i), {
      target: { value: '0' },
    });

    await user.click(within(dialog).getByRole('button', { name: 'Create aircraft' }));

    expect(await screen.findByText('9M-NEW')).toBeInTheDocument();
  });

  it('edits an aircraft and can cancel the dialog', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminAircraftPage />, {
      initialEntries: ['/admin/aircraft'],
    });

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'Edit 9M-AAA' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Edit 9M-AAA' })).toBeInTheDocument();

    fireEvent.change(within(dialog).getByPlaceholderText('A320'), {
      target: { value: 'A320neo' },
    });
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        mockAdminAircraftApi.getState().find((aircraft) => aircraft.registration === '9M-AAA')
          ?.model,
      ).toBe('A320neo');
    });

    await user.click(screen.getByRole('button', { name: 'Edit 9M-AAA' }));
    const editDialog = await screen.findByRole('dialog');
    await user.click(within(editDialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('activates and deactivates an aircraft', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminAircraftPage />, {
      initialEntries: ['/admin/aircraft'],
    });

    await screen.findByText('9M-AAZ');
    const activateButtons = screen.getAllByRole('button', { name: 'Activate' });
    await user.click(activateButtons[0]!);

    await waitFor(() => {
      expect(
        mockAdminAircraftApi.getState().find((aircraft) => aircraft.registration === '9M-AAZ')
          ?.active,
      ).toBe(true);
    });
  });

  it('deletes an aircraft with confirmation', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminAircraftPage />, {
      initialEntries: ['/admin/aircraft'],
    });

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'Delete 9M-AAA' }));

    const confirm = await screen.findByRole('dialog');
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByText('9M-AAA')).not.toBeInTheDocument();
    });
  });
});
