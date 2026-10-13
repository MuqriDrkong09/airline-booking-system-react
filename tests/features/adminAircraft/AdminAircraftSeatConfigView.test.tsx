import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { queryClient } from '@/app/providers/queryClient';
import {
  adminAircraftApi,
  adminAircraftKeys,
  AdminAircraftSeatConfigView,
  createSeedAdminAircraft,
  mockAdminAircraftApi,
} from '@/features/adminAircraft';
import { APP_ROUTES } from '@/constants/routes';
import { renderWithProviders } from '@tests/utils/test-utils';

function renderSeatConfigView(aircraftId: string) {
  return renderWithProviders(
    <Routes>
      <Route
        path="/admin/aircraft/:aircraftId/seats"
        element={<AdminAircraftSeatConfigView aircraftId={aircraftId} />}
      />
      <Route path={APP_ROUTES.admin.aircraft} element={<div>Aircraft list page</div>} />
    </Routes>,
    { initialEntries: [`/admin/aircraft/${aircraftId}/seats`] },
  );
}

async function dismissAlertContaining(text: string) {
  const alerts = screen.getAllByRole('alert').filter((alert) => within(alert).queryByText(text));
  expect(alerts.length).toBeGreaterThan(0);
  const closeButton = within(alerts[0]!).getByRole('button');
  await userEvent.setup({ delay: null }).click(closeButton);
}

describe('AdminAircraftSeatConfigView', () => {
  const aircraft = createSeedAdminAircraft()[0]!;

  beforeEach(() => {
    mockAdminAircraftApi.reset();
    queryClient.clear();
    queryClient.removeQueries({ queryKey: adminAircraftKeys.all });
    jest.restoreAllMocks();
  });

  it('shows a seat map loading skeleton while the aircraft detail is pending', async () => {
    let resolveAircraft: ((value: typeof aircraft) => void) | undefined;
    jest.spyOn(adminAircraftApi, 'getAircraft').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAircraft = resolve;
        }),
    );

    renderSeatConfigView(aircraft.id);

    expect(screen.getByRole('status', { name: 'Loading seat map' })).toBeInTheDocument();

    resolveAircraft?.(aircraft);
    expect(await screen.findByText(`${aircraft.registration} · Airbus A320`)).toBeInTheDocument();
  });

  it('renders the aircraft heading and interactive seat map editor', async () => {
    renderSeatConfigView(aircraft.id);

    expect(await screen.findByText(`${aircraft.registration} · Airbus A320`)).toBeInTheDocument();
    expect(screen.getByText(/configure rows, columns, seat labels/i)).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: /seat map editor/i })).toBeInTheDocument();
  });

  it('shows an error state and retries loading the aircraft', async () => {
    const user = userEvent.setup({ delay: null });
    const getAircraft = jest
      .spyOn(adminAircraftApi, 'getAircraft')
      .mockRejectedValue(new Error('boom'));

    renderSeatConfigView(aircraft.id);

    expect(
      await screen.findByText('Unable to load aircraft', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/may have been removed|could not be loaded/i)).toBeInTheDocument();

    getAircraft.mockResolvedValue(aircraft);
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByText(`${aircraft.registration} · Airbus A320`)).toBeInTheDocument();
  });

  it('navigates back to the aircraft list when Back is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    renderSeatConfigView(aircraft.id);

    expect(await screen.findByRole('grid', { name: /seat map editor/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByText('Aircraft list page')).toBeInTheDocument();
  });

  it('saves the seat map and shows a dismissible success alert', async () => {
    const user = userEvent.setup({ delay: null });
    renderSeatConfigView(aircraft.id);

    expect(await screen.findByRole('grid', { name: /seat map editor/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^Price$/i), {
      target: { value: '42' },
    });
    await user.click(screen.getByRole('button', { name: 'Save seat map' }));

    expect(await screen.findByText('Seat map saved successfully.')).toBeInTheDocument();

    await dismissAlertContaining('Seat map saved successfully.');
    await waitFor(() => {
      expect(screen.queryByText('Seat map saved successfully.')).not.toBeInTheDocument();
    });
  });

  it('surfaces save failures in a view-level error alert that can be dismissed', async () => {
    const user = userEvent.setup({ delay: null });
    jest
      .spyOn(adminAircraftApi, 'updateAircraft')
      .mockRejectedValue(new Error('Seat map validation failed on server'));

    renderSeatConfigView(aircraft.id);

    expect(await screen.findByRole('grid', { name: /seat map editor/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save seat map' }));

    await waitFor(() => {
      expect(screen.getAllByText('Seat map validation failed on server').length).toBeGreaterThan(0);
    });

    // View-level mutation alert is rendered above the editor validation alert.
    const viewAlert = screen.getAllByRole('alert')[0]!;
    expect(within(viewAlert).getByText('Seat map validation failed on server')).toBeInTheDocument();

    await user.click(within(viewAlert).getByRole('button'));
    await waitFor(() => {
      expect(screen.getAllByRole('alert')).toHaveLength(1);
    });
  });

  it('shows a fallback save error message for non-Error failures', async () => {
    const user = userEvent.setup({ delay: null });
    jest.spyOn(adminAircraftApi, 'updateAircraft').mockRejectedValue('unavailable');

    renderSeatConfigView(aircraft.id);

    expect(await screen.findByRole('grid', { name: /seat map editor/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save seat map' }));

    expect(
      await screen.findByText('Unable to save the seat map. Please try again.'),
    ).toBeInTheDocument();
  });
});
