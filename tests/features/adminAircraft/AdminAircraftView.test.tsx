import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { queryClient } from '@/app/providers/queryClient';
import {
  adminAircraftApi,
  adminAircraftKeys,
  AdminAircraftView,
  createSeedAdminAircraft,
  mockAdminAircraftApi,
} from '@/features/adminAircraft';
import { renderWithProviders } from '@tests/utils/test-utils';

function renderAdminAircraftView(initialEntry = '/admin/aircraft') {
  return renderWithProviders(
    <Routes>
      <Route path="/admin/aircraft" element={<AdminAircraftView />} />
      <Route
        path="/admin/aircraft/:aircraftId/seats"
        element={<div>Seat configuration page</div>}
      />
    </Routes>,
    { initialEntries: [initialEntry] },
  );
}

async function chooseSelectOption(
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp,
  optionName: RegExp,
) {
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name: optionName }));
}

async function fillCreateAircraftForm(
  dialog: HTMLElement,
  values: {
    manufacturer: string;
    model: string;
    registration: string;
    totalSeats: string;
    economy: string;
    premium: string;
    business: string;
    first: string;
  },
) {
  fireEvent.change(within(dialog).getByPlaceholderText('Airbus'), {
    target: { value: values.manufacturer },
  });
  fireEvent.change(within(dialog).getByPlaceholderText('A320'), {
    target: { value: values.model },
  });
  fireEvent.change(within(dialog).getByPlaceholderText('9M-AAA'), {
    target: { value: values.registration },
  });
  fireEvent.change(within(dialog).getByLabelText(/^Total seats/i), {
    target: { value: values.totalSeats },
  });
  fireEvent.change(within(dialog).getByLabelText(/^Economy seats/i), {
    target: { value: values.economy },
  });
  fireEvent.change(within(dialog).getByLabelText(/^Premium economy seats/i), {
    target: { value: values.premium },
  });
  fireEvent.change(within(dialog).getByLabelText(/^Business seats/i), {
    target: { value: values.business },
  });
  fireEvent.change(within(dialog).getByLabelText(/^First class seats/i), {
    target: { value: values.first },
  });
}

describe('AdminAircraftView', () => {
  beforeEach(() => {
    mockAdminAircraftApi.reset();
    queryClient.removeQueries({ queryKey: adminAircraftKeys.all });
    jest.restoreAllMocks();
  });

  it('shows a table loading skeleton while the aircraft list is pending', async () => {
    let resolveList: ((value: ReturnType<typeof createSeedAdminAircraft>) => void) | undefined;
    jest.spyOn(adminAircraftApi, 'listAircraft').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveList = resolve;
        }),
    );

    renderAdminAircraftView();

    expect(screen.getByRole('status', { name: 'Loading table' })).toBeInTheDocument();
    expect(screen.getByLabelText('Aircraft filters')).toBeInTheDocument();

    resolveList?.(createSeedAdminAircraft());
    expect(await screen.findByText('9M-AAA')).toBeInTheDocument();
  });

  it('lists aircraft with a count and filters by search, manufacturer, and status', async () => {
    const user = userEvent.setup({ delay: null });

    renderAdminAircraftView();

    expect(await screen.findByText(/5 aircraft/i)).toBeInTheDocument();
    expect(screen.getByText('9M-AAA')).toBeInTheDocument();
    expect(screen.getByText('9M-AAZ')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'AAZ' },
    });

    await waitFor(() => {
      expect(screen.getByText('9M-AAZ')).toBeInTheDocument();
      expect(screen.queryByText('9M-AAA')).not.toBeInTheDocument();
      expect(screen.getByText(/1 aircraft/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    await waitFor(() => {
      expect(screen.getByText('9M-AAA')).toBeInTheDocument();
      expect(screen.getByText(/5 aircraft/i)).toBeInTheDocument();
    });

    await chooseSelectOption(user, /^Manufacturer$/i, /^Boeing$/i);

    await waitFor(() => {
      expect(screen.getByText('9M-BAC')).toBeInTheDocument();
      expect(screen.queryByText('9M-AAA')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await chooseSelectOption(user, /^Status$/i, /^Inactive$/i);

    await waitFor(() => {
      expect(screen.getByText('9M-AAZ')).toBeInTheDocument();
      expect(screen.queryByText('9M-AAA')).not.toBeInTheDocument();
      expect(screen.getByText(/1 aircraft/i)).toBeInTheDocument();
    });
  });

  it('shows an empty state when no aircraft match and can open create from it', async () => {
    const user = userEvent.setup({ delay: null });
    jest.spyOn(adminAircraftApi, 'listAircraft').mockResolvedValue([]);

    renderAdminAircraftView();

    expect(await screen.findByRole('heading', { name: 'No aircraft found' })).toBeInTheDocument();
    expect(screen.getByText(/0 aircraft/i)).toBeInTheDocument();

    // Header + empty-state both expose "Create aircraft"; use the empty-state action.
    const createButtons = screen.getAllByRole('button', { name: 'Create aircraft' });
    expect(createButtons.length).toBeGreaterThanOrEqual(2);
    await user.click(createButtons[createButtons.length - 1]!);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Create aircraft' })).toBeInTheDocument();
  });

  it('treats a null list response as an empty fleet', async () => {
    jest.spyOn(adminAircraftApi, 'listAircraft').mockResolvedValue(null as never);

    renderAdminAircraftView();

    expect(await screen.findByRole('heading', { name: 'No aircraft found' })).toBeInTheDocument();
    expect(screen.getByText(/0 aircraft/i)).toBeInTheDocument();
  });

  it('shows an error state and retries the aircraft query', async () => {
    const user = userEvent.setup({ delay: null });
    const listAircraft = jest
      .spyOn(adminAircraftApi, 'listAircraft')
      .mockRejectedValue(new Error('boom'));

    renderAdminAircraftView();

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

    renderAdminAircraftView();

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'View 9M-AAA' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Seat-map configuration')).toBeInTheDocument();
    expect(within(dialog).getByText('Airbus A320')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Seat-map cabins')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens edit from the details dialog', async () => {
    const user = userEvent.setup({ delay: null });

    renderAdminAircraftView();

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'View 9M-AAA' }));

    const details = await screen.findByRole('dialog');
    await user.click(within(details).getByRole('button', { name: 'Edit aircraft' }));

    const editDialog = await screen.findByRole('dialog');
    expect(within(editDialog).getByRole('heading', { name: 'Edit 9M-AAA' })).toBeInTheDocument();
  });

  it('navigates to seat configuration from the table actions', async () => {
    const user = userEvent.setup({ delay: null });

    renderAdminAircraftView();

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'Configure seats 9M-AAA' }));

    expect(await screen.findByText('Seat configuration page')).toBeInTheDocument();
  });

  it('navigates to seat configuration from the details dialog', async () => {
    const user = userEvent.setup({ delay: null });

    renderAdminAircraftView();

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'View 9M-AAA' }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Configure seats' }));

    expect(await screen.findByText('Seat configuration page')).toBeInTheDocument();
  });

  it('creates an aircraft through the dialog form', async () => {
    const user = userEvent.setup({ delay: null });

    renderAdminAircraftView();

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'Create aircraft' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Create aircraft' })).toBeInTheDocument();

    fillCreateAircraftForm(dialog, {
      manufacturer: 'Embraer',
      model: 'E190',
      registration: '9M-NEW',
      totalSeats: '100',
      economy: '96',
      premium: '0',
      business: '4',
      first: '0',
    });

    await user.click(within(dialog).getByRole('button', { name: 'Create aircraft' }));

    expect(await screen.findByText('9M-NEW')).toBeInTheDocument();
    expect(screen.getByText(/6 aircraft/i)).toBeInTheDocument();
  });

  it('shows and dismisses a create error', async () => {
    const user = userEvent.setup({ delay: null });
    jest
      .spyOn(adminAircraftApi, 'createAircraft')
      .mockRejectedValue(new Error('An aircraft with this registration already exists'));

    renderAdminAircraftView();

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'Create aircraft' }));

    const dialog = await screen.findByRole('dialog');
    fillCreateAircraftForm(dialog, {
      manufacturer: 'Embraer',
      model: 'E190',
      registration: '9M-DUP',
      totalSeats: '100',
      economy: '96',
      premium: '0',
      business: '4',
      first: '0',
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create aircraft' }));

    expect(
      await screen.findByText('An aircraft with this registration already exists'),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Create aircraft' })).not.toBeInTheDocument();
    });

    const alert = screen.getByRole('alert');
    fireEvent.click(within(alert).getByRole('button', { name: /close/i }));
    await waitFor(() => {
      expect(
        screen.queryByText('An aircraft with this registration already exists'),
      ).not.toBeInTheDocument();
    });
  });

  it('edits an aircraft and can cancel the dialog', async () => {
    const user = userEvent.setup({ delay: null });

    renderAdminAircraftView();

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

  it('shows an edit error when the update fails', async () => {
    const user = userEvent.setup({ delay: null });
    jest
      .spyOn(adminAircraftApi, 'updateAircraft')
      .mockRejectedValue(new Error('Aircraft not found'));

    renderAdminAircraftView();

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'Edit 9M-AAA' }));

    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByPlaceholderText('A320'), {
      target: { value: 'A320neo' },
    });
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Aircraft not found')).toBeInTheDocument();
  });

  it('shows a fallback save error when create fails with a non-Error value', async () => {
    const user = userEvent.setup({ delay: null });
    jest.spyOn(adminAircraftApi, 'createAircraft').mockRejectedValue('nope');

    renderAdminAircraftView();

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'Create aircraft' }));

    const dialog = await screen.findByRole('dialog');
    fillCreateAircraftForm(dialog, {
      manufacturer: 'Embraer',
      model: 'E190',
      registration: '9M-FALLBACK',
      totalSeats: '100',
      economy: '96',
      premium: '0',
      business: '4',
      first: '0',
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create aircraft' }));

    expect(
      await screen.findByText('Unable to save the aircraft. Please try again.'),
    ).toBeInTheDocument();
  });

  it('activates and deactivates an aircraft', async () => {
    const user = userEvent.setup({ delay: null });

    renderAdminAircraftView();

    await screen.findByText('9M-AAZ');
    const inactiveRow = screen.getByText('9M-AAZ').closest('tr');
    expect(inactiveRow).toBeTruthy();

    await user.click(within(inactiveRow as HTMLElement).getByRole('button', { name: 'Activate' }));

    await waitFor(() => {
      expect(
        mockAdminAircraftApi.getState().find((aircraft) => aircraft.registration === '9M-AAZ')
          ?.active,
      ).toBe(true);
    });

    const activeRow = screen.getByText('9M-AAZ').closest('tr');
    expect(activeRow).toBeTruthy();
    await user.click(
      within(activeRow as HTMLElement).getByRole('button', { name: 'Deactivate' }),
    );

    await waitFor(() => {
      expect(
        mockAdminAircraftApi.getState().find((aircraft) => aircraft.registration === '9M-AAZ')
          ?.active,
      ).toBe(false);
    });
  });

  it('shows an error when toggling active status fails', async () => {
    const user = userEvent.setup({ delay: null });
    jest
      .spyOn(adminAircraftApi, 'setAircraftActive')
      .mockRejectedValue(new Error('status boom'));

    renderAdminAircraftView();

    await screen.findByText('9M-AAZ');
    await user.click(screen.getAllByRole('button', { name: 'Activate' })[0]!);

    expect(
      await screen.findByText('Unable to update status for 9M-AAZ.'),
    ).toBeInTheDocument();
  });

  it('cancels delete confirmation without removing the aircraft', async () => {
    const user = userEvent.setup({ delay: null });

    renderAdminAircraftView();

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'Delete 9M-AAA' }));

    const confirm = await screen.findByRole('dialog');
    expect(within(confirm).getByText(/Delete 9M-AAA/i)).toBeInTheDocument();
    await user.click(within(confirm).getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.getByText('9M-AAA')).toBeInTheDocument();
  });

  it('deletes an aircraft with confirmation', async () => {
    const user = userEvent.setup({ delay: null });

    renderAdminAircraftView();

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'Delete 9M-AAA' }));

    const confirm = await screen.findByRole('dialog');
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByText('9M-AAA')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/4 aircraft/i)).toBeInTheDocument();
  });

  it('shows an error when delete fails', async () => {
    const user = userEvent.setup({ delay: null });
    jest.spyOn(adminAircraftApi, 'deleteAircraft').mockRejectedValue(new Error('delete boom'));

    renderAdminAircraftView();

    await screen.findByText('9M-AAA');
    await user.click(screen.getByRole('button', { name: 'Delete 9M-AAA' }));

    const confirm = await screen.findByRole('dialog');
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Unable to delete 9M-AAA.')).toBeInTheDocument();
    expect(screen.getByText('9M-AAA')).toBeInTheDocument();
  });
});
