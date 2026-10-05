import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryClient } from '@/app/providers/queryClient';
import {
  adminFlightKeys,
  mockAdminFlightsApi,
} from '@/features/adminFlights';
import { AdminFlightsPage } from '@/pages/admin/AdminFlightsPage';
import { renderWithProviders } from '@tests/utils/test-utils';

async function chooseSelectOption(
  user: ReturnType<typeof userEvent.setup>,
  root: HTMLElement,
  comboboxName: RegExp,
  optionName: RegExp,
) {
  await user.click(within(root).getByRole('combobox', { name: comboboxName }));
  const listbox = await screen.findByRole('listbox');
  await user.click(within(listbox).getByRole('option', { name: optionName }));
  await waitFor(() => {
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
}

describe('AdminFlightsPage', () => {
  beforeEach(() => {
    mockAdminFlightsApi.reset();
    queryClient.clear();
    queryClient.removeQueries({ queryKey: adminFlightKeys.all });
  });

  it('lists flights and filters by search', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminFlightsPage />, {
      initialEntries: ['/admin/flights'],
    });

    expect(await screen.findByRole('heading', { name: 'Flights' })).toBeInTheDocument();
    expect(await screen.findByText('MH1')).toBeInTheDocument();
    expect(screen.getByText('SQ118')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'SQ118' },
    });

    await waitFor(() => {
      expect(screen.getByText('SQ118')).toBeInTheDocument();
      expect(screen.queryByText('MH1')).not.toBeInTheDocument();
    });
  });

  it(
    'creates a flight through the dialog form',
    async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(<AdminFlightsPage />, {
        initialEntries: ['/admin/flights'],
      });

      await screen.findByText('MH1');
      await user.click(screen.getByRole('button', { name: 'Create flight' }));

      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByRole('heading', { name: 'Create flight' })).toBeInTheDocument();

      await chooseSelectOption(user, dialog, /^Airline$/i, /MH · Malaysia Airlines/i);
      fireEvent.change(within(dialog).getByPlaceholderText('MH123'), {
        target: { value: 'MH888' },
      });
      await chooseSelectOption(user, dialog, /^Origin$/i, /KUL · Kuala Lumpur/i);
      await chooseSelectOption(user, dialog, /^Destination$/i, /SIN · Singapore/i);
      await chooseSelectOption(user, dialog, /^Aircraft$/i, /Airbus A320/i);

      fireEvent.change(within(dialog).getByLabelText(/^Departure/i), {
        target: { value: '2026-12-01T10:00' },
      });
      fireEvent.change(within(dialog).getByLabelText(/^Arrival/i), {
        target: { value: '2026-12-01T11:10' },
      });
      fireEvent.change(within(dialog).getByPlaceholderText('T1'), {
        target: { value: 'T1' },
      });
      fireEvent.change(within(dialog).getByPlaceholderText('A12'), {
        target: { value: 'C1' },
      });

      await user.click(within(dialog).getByRole('button', { name: 'Create flight' }));

      expect(await screen.findByText('MH888', {}, { timeout: 3000 })).toBeInTheDocument();
    },
    15_000,
  );

  it('updates status and deletes a flight', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminFlightsPage />, {
      initialEntries: ['/admin/flights'],
    });

    expect(await screen.findByText('MH1')).toBeInTheDocument();

    const flightCell = screen.getByText('MH1');
    const row = flightCell.closest('tr');
    expect(row).not.toBeNull();

    await user.click(within(row as HTMLElement).getByLabelText('Update status'));
    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByRole('option', { name: 'Delayed' }));

    await waitFor(() => {
      expect(
        mockAdminFlightsApi.getState().find((flight) => flight.flightNumber === 'MH1')?.status,
      ).toBe('DELAYED');
    });

    await user.click(screen.getByRole('button', { name: 'Delete MH1' }));
    const confirm = await screen.findByRole('dialog');
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByText('MH1')).not.toBeInTheDocument();
    });
  });
});
