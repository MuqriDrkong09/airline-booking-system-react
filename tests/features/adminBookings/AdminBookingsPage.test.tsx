import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryClient } from '@/app/providers/queryClient';
import {
  adminBookingKeys,
  adminBookingsApi,
  createSeedAdminBookings,
  mockAdminBookingsApi,
} from '@/features/adminBookings';
import { AdminBookingsPage } from '@/pages/admin/AdminBookingsPage';
import { renderWithProviders } from '@tests/utils/test-utils';

async function chooseSelectOption(
  user: ReturnType<typeof userEvent.setup>,
  comboboxName: RegExp,
  optionName: RegExp,
) {
  await user.click(screen.getByRole('combobox', { name: comboboxName }));
  const listbox = await screen.findByRole('listbox');
  await user.click(within(listbox).getByRole('option', { name: optionName }));
  await waitFor(() => {
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
}

describe('AdminBookingsPage', () => {
  beforeEach(() => {
    mockAdminBookingsApi.reset();
    queryClient.clear();
    queryClient.removeQueries({ queryKey: adminBookingKeys.all });
    jest.restoreAllMocks();
  });

  it('lists bookings and filters by search', async () => {
    renderWithProviders(<AdminBookingsPage />, {
      initialEntries: ['/admin/bookings'],
    });

    expect(await screen.findByRole('heading', { name: 'Bookings' })).toBeInTheDocument();
    expect(await screen.findByText('AB-ADMIN001')).toBeInTheDocument();
    expect(screen.getByText('AB-ADMIN002')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'AB-ADMIN001' },
    });

    await waitFor(() => {
      expect(screen.getByText('AB-ADMIN001')).toBeInTheDocument();
      expect(screen.queryByText('AB-ADMIN002')).not.toBeInTheDocument();
    });
  });

  it('filters by status and flight', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminBookingsPage />, {
      initialEntries: ['/admin/bookings'],
    });

    await screen.findByText('AB-ADMIN001');

    await chooseSelectOption(user, /^Status$/i, /^Pending$/i);

    await waitFor(() => {
      expect(screen.getByText('AB-ADMIN002')).toBeInTheDocument();
      expect(screen.queryByText('AB-ADMIN001')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await screen.findByText('AB-ADMIN001');

    await chooseSelectOption(user, /^Flight$/i, /^MH1$/i);

    await waitFor(() => {
      expect(screen.getByText('AB-ADMIN001')).toBeInTheDocument();
      expect(screen.queryByText('AB-ADMIN002')).not.toBeInTheDocument();
    });
  });

  it('opens booking details from the table', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminBookingsPage />, {
      initialEntries: ['/admin/bookings'],
    });

    await screen.findByText('AB-ADMIN001');
    await user.click(screen.getByRole('button', { name: 'View AB-ADMIN001' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Booking AB-ADMIN001' })).toBeInTheDocument();
    expect(within(dialog).getByText('aisha@example.com')).toBeInTheDocument();
  });

  it('modifies primary contact details', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminBookingsPage />, {
      initialEntries: ['/admin/bookings'],
    });

    await screen.findByText('AB-ADMIN001');
    await user.click(screen.getByRole('button', { name: 'Modify AB-ADMIN001' }));

    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Contact email'), {
      target: { value: 'aisha.updated@example.com' },
    });
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(
      await screen.findByText('Updated contact details for AB-ADMIN001.'),
    ).toBeInTheDocument();
    expect(
      mockAdminBookingsApi.getState().find((booking) => booking.reference === 'AB-ADMIN001')
        ?.passengers[0]?.email,
    ).toBe('aisha.updated@example.com');
  });

  it('cancels a booking through the cancellation dialog', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminBookingsPage />, {
      initialEntries: ['/admin/bookings'],
    });

    await screen.findByText('AB-ADMIN001');
    await user.click(screen.getByRole('button', { name: 'Cancel AB-ADMIN001' }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    await user.click(within(dialog).getByRole('button', { name: 'Confirm cancellation' }));

    await waitFor(() => {
      const status = mockAdminBookingsApi
        .getState()
        .find((booking) => booking.reference === 'AB-ADMIN001')?.status;
      expect(['CANCELLED', 'REFUNDED']).toContain(status);
    });
  });

  it('refunds a cancelled booking', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminBookingsPage />, {
      initialEntries: ['/admin/bookings'],
    });

    await screen.findByText('AB-ADMIN004');
    await user.click(screen.getByRole('button', { name: 'Refund AB-ADMIN004' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Refund booking' })).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Refund' }));

    expect(await screen.findByText('Refund processed for AB-ADMIN004.')).toBeInTheDocument();
    expect(
      mockAdminBookingsApi.getState().find((booking) => booking.reference === 'AB-ADMIN004')
        ?.status,
    ).toBe('REFUNDED');
  });

  it('supports sorting and pagination query changes', async () => {
    const user = userEvent.setup({ delay: null });
    const listSpy = jest.spyOn(adminBookingsApi, 'listBookings');

    renderWithProviders(<AdminBookingsPage />, {
      initialEntries: ['/admin/bookings'],
    });

    await screen.findByText('AB-ADMIN001');
    expect(listSpy).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Reference/i }));

    await waitFor(() => {
      const lastCall = listSpy.mock.calls.at(-1)?.[0];
      expect(lastCall?.sortBy).toBe('reference');
      expect(lastCall?.sortDir).toBe('asc');
    });

    const rowsPerPage = screen.getByRole('combobox', { name: /rows per page/i });
    await user.click(rowsPerPage);
    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByRole('option', { name: '5' }));

    await waitFor(() => {
      const lastCall = listSpy.mock.calls.at(-1)?.[0];
      expect(lastCall?.pageSize).toBe(5);
      expect(lastCall?.page).toBe(1);
    });
  });

  it('shows an error state and retries', async () => {
    const user = userEvent.setup({ delay: null });
    const listBookings = jest
      .spyOn(adminBookingsApi, 'listBookings')
      .mockRejectedValue(new Error('boom'));

    renderWithProviders(<AdminBookingsPage />, {
      initialEntries: ['/admin/bookings'],
    });

    expect(
      await screen.findByText('Unable to load bookings', {}, { timeout: 3000 }),
    ).toBeInTheDocument();

    listBookings.mockResolvedValue({
      items: createSeedAdminBookings(),
      total: createSeedAdminBookings().length,
      page: 1,
      pageSize: 10,
      pageCount: 1,
    });
    await user.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText('AB-ADMIN001')).toBeInTheDocument();
    });
  });
});
