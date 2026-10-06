import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryClient } from '@/app/providers/queryClient';
import {
  adminPromoCodeKeys,
  adminPromoCodesApi,
  createSeedAdminPromoCodes,
  mockAdminPromoCodesApi,
} from '@/features/adminPromoCodes';
import { AdminPromoCodesPage } from '@/pages/admin/AdminPromoCodesPage';
import { renderWithProviders } from '@tests/utils/test-utils';

async function chooseSelectOption(
  user: ReturnType<typeof userEvent.setup>,
  comboboxName: RegExp,
  optionName: RegExp,
  root?: HTMLElement,
) {
  const scope = root ? within(root) : screen;
  await user.click(scope.getByRole('combobox', { name: comboboxName }));
  const listbox = await screen.findByRole('listbox');
  await user.click(within(listbox).getByRole('option', { name: optionName }));
  await waitFor(() => {
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
}

describe('AdminPromoCodesPage', () => {
  beforeEach(() => {
    mockAdminPromoCodesApi.reset();
    queryClient.clear();
    queryClient.removeQueries({ queryKey: adminPromoCodeKeys.all });
    jest.restoreAllMocks();
  });

  it('lists promo codes and filters by search', async () => {
    renderWithProviders(<AdminPromoCodesPage />, {
      initialEntries: ['/admin/promo-codes'],
    });

    expect(await screen.findByRole('heading', { name: 'Promo Codes' })).toBeInTheDocument();
    expect(await screen.findByText('FLIGHT100')).toBeInTheDocument();
    expect(screen.getByText('SAVE15')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'SAVE15' },
    });

    await waitFor(() => {
      expect(screen.getByText('SAVE15')).toBeInTheDocument();
      expect(screen.queryByText('FLIGHT100')).not.toBeInTheDocument();
    });
  });

  it('filters by discount type and status', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminPromoCodesPage />, {
      initialEntries: ['/admin/promo-codes'],
    });

    await screen.findByText('FLIGHT100');
    await chooseSelectOption(user, /^Discount type$/i, /^Percentage$/i);

    await waitFor(() => {
      expect(screen.getByText('SAVE15')).toBeInTheDocument();
      expect(screen.queryByText('FLIGHT100')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await screen.findByText('FLIGHT100');

    await chooseSelectOption(user, /^Status$/i, /^Inactive$/i);

    await waitFor(() => {
      expect(screen.getByText('EXPIRED10')).toBeInTheDocument();
      expect(screen.queryByText('FLIGHT100')).not.toBeInTheDocument();
    });
  });

  it(
    'creates a promo code through the dialog form',
    async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(<AdminPromoCodesPage />, {
        initialEntries: ['/admin/promo-codes'],
      });

      await screen.findByText('FLIGHT100');
      await user.click(screen.getByRole('button', { name: 'Create promo code' }));

      const dialog = await screen.findByRole('dialog');
      expect(
        within(dialog).getByRole('heading', { name: 'Create promo code' }),
      ).toBeInTheDocument();

      fireEvent.change(within(dialog).getByPlaceholderText('SAVE15'), {
        target: { value: 'SUMMER10' },
      });
      fireEvent.change(within(dialog).getByPlaceholderText('15% off bookings'), {
        target: { value: 'Summer 10% off' },
      });
      await chooseSelectOption(user, /^Discount type$/i, /^Percentage$/i, dialog);
      fireEvent.change(within(dialog).getByLabelText(/^Discount value/i), {
        target: { value: '10' },
      });
      fireEvent.change(within(dialog).getByLabelText(/^Minimum booking amount/i), {
        target: { value: '100' },
      });
      fireEvent.change(within(dialog).getByLabelText(/^Maximum discount/i), {
        target: { value: '40' },
      });
      fireEvent.change(within(dialog).getByLabelText(/^Start date/i), {
        target: { value: '2026-06-01' },
      });
      fireEvent.change(within(dialog).getByLabelText(/^End date/i), {
        target: { value: '2026-08-31' },
      });
      fireEvent.change(within(dialog).getByLabelText(/^Usage limit/i), {
        target: { value: '250' },
      });

      fireEvent.click(within(dialog).getByRole('button', { name: 'Create promo code' }));

      expect(await screen.findByText('SUMMER10', {}, { timeout: 3000 })).toBeInTheDocument();
    },
    15_000,
  );

  it('edits a promo code and deletes with confirmation', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminPromoCodesPage />, {
      initialEntries: ['/admin/promo-codes'],
    });

    await screen.findByText('FLAT50');
    await user.click(screen.getByRole('button', { name: 'Edit FLAT50' }));

    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/^Description/i), {
      target: { value: 'Updated flat fifty' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(
        mockAdminPromoCodesApi.getState().find((promo) => promo.code === 'FLAT50')?.description,
      ).toBe('Updated flat fifty');
    });
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Edit FLAT50' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Delete FLAT50' }));
    const confirm = await screen.findByRole('dialog');
    expect(within(confirm).getByRole('heading', { name: 'Delete promo code' })).toBeInTheDocument();
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByText('FLAT50')).not.toBeInTheDocument();
    });
  });

  it('activates and deactivates a promo code', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AdminPromoCodesPage />, {
      initialEntries: ['/admin/promo-codes'],
    });

    await screen.findByText('WELCOME20');
    const welcomeRow = screen.getByText('WELCOME20').closest('tr');
    expect(welcomeRow).not.toBeNull();
    await user.click(within(welcomeRow as HTMLElement).getByRole('button', { name: 'Activate' }));

    await waitFor(() => {
      expect(
        mockAdminPromoCodesApi.getState().find((promo) => promo.code === 'WELCOME20')?.active,
      ).toBe(true);
      const row = screen.getByText('WELCOME20').closest('tr');
      expect(row).not.toBeNull();
      expect(within(row as HTMLElement).getByRole('button', { name: 'Deactivate' })).toBeEnabled();
    });

    const activeRow = screen.getByText('WELCOME20').closest('tr');
    await user.click(within(activeRow as HTMLElement).getByRole('button', { name: 'Deactivate' }));

    await waitFor(() => {
      expect(
        mockAdminPromoCodesApi.getState().find((promo) => promo.code === 'WELCOME20')?.active,
      ).toBe(false);
      const row = screen.getByText('WELCOME20').closest('tr');
      expect(within(row as HTMLElement).getByRole('button', { name: 'Activate' })).toBeEnabled();
    });
  });

  it('shows an error state and retries', async () => {
    const user = userEvent.setup({ delay: null });
    const listPromoCodes = jest
      .spyOn(adminPromoCodesApi, 'listPromoCodes')
      .mockRejectedValue(new Error('boom'));

    renderWithProviders(<AdminPromoCodesPage />, {
      initialEntries: ['/admin/promo-codes'],
    });

    expect(
      await screen.findByText('Unable to load promo codes', {}, { timeout: 3000 }),
    ).toBeInTheDocument();

    listPromoCodes.mockResolvedValue(createSeedAdminPromoCodes());
    await user.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText('FLIGHT100')).toBeInTheDocument();
    });
  });
});
