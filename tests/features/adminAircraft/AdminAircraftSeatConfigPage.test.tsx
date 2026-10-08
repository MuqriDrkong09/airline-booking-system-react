import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { queryClient } from '@/app/providers/queryClient';
import {
  adminAircraftKeys,
  createSeedAdminAircraft,
  mockAdminAircraftApi,
} from '@/features/adminAircraft';
import { AdminAircraftSeatConfigPage } from '@/pages/admin/AdminAircraftSeatConfigPage';
import { renderWithProviders } from '@tests/utils/test-utils';

async function chooseSelectOption(
  user: ReturnType<typeof userEvent.setup>,
  comboboxName: RegExp,
  optionName: RegExp | string,
) {
  await user.click(screen.getByRole('combobox', { name: comboboxName }));
  const listbox = await screen.findByRole('listbox');
  await user.click(
    typeof optionName === 'string'
      ? screen.getByRole('option', { name: optionName })
      : screen.getByRole('option', { name: optionName }),
  );
  await waitFor(() => {
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
}

function renderSeatConfigPage(aircraftId: string) {
  return renderWithProviders(
    <Routes>
      <Route
        path="/admin/aircraft/:aircraftId/seats"
        element={<AdminAircraftSeatConfigPage />}
      />
    </Routes>,
    { initialEntries: [`/admin/aircraft/${aircraftId}/seats`] },
  );
}

describe('AdminAircraftSeatConfigPage', () => {
  const aircraft = createSeedAdminAircraft()[0]!;

  beforeEach(() => {
    mockAdminAircraftApi.reset();
    queryClient.clear();
    queryClient.removeQueries({ queryKey: adminAircraftKeys.all });
  });

  it('loads the interactive seat map editor for an aircraft', async () => {
    renderSeatConfigPage(aircraft.id);

    expect(
      await screen.findByRole('heading', { name: 'Seat configuration' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(`${aircraft.registration} · Airbus A320`),
    ).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: /seat map editor/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Seat type legend')).toBeInTheDocument();
  });

  it(
    'updates a seat and saves the validated seat map',
    async () => {
      const user = userEvent.setup({ delay: null });
      renderSeatConfigPage(aircraft.id);

      expect(await screen.findByRole('grid', { name: /seat map editor/i })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /^Configure seat 1A\b/i }));
      await chooseSelectOption(user, /^Seat type$/i, 'Premium');

      fireEvent.change(screen.getByLabelText(/^Price$/i), {
        target: { value: '55' },
      });

      await user.click(screen.getByRole('button', { name: 'Save seat map' }));

      expect(
        await screen.findByText('Seat map saved successfully.', {}, { timeout: 3000 }),
      ).toBeInTheDocument();

      await waitFor(() => {
        const saved = mockAdminAircraftApi
          .getState()
          .find((item) => item.id === aircraft.id)?.seatMapConfig;
        const seat = saved?.seats.find((item) => item.label === '1A');
        expect(seat?.seatType).toBe('PREMIUM');
        expect(seat?.price).toBe(55);
        expect(saved?.version).toBeGreaterThan(aircraft.seatMapConfig?.version ?? 0);
      });
    },
    15_000,
  );

  it(
    'applies a new row/column layout from the controls',
    async () => {
      renderSeatConfigPage(aircraft.id);

      await screen.findByRole('grid', { name: /seat map editor/i });

      fireEvent.change(screen.getByLabelText('Rows'), {
        target: { value: '4' },
      });
      fireEvent.change(screen.getByLabelText('Columns'), {
        target: { value: 'A | F' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Apply layout' }));

      await waitFor(() => {
        expect(screen.getByText(/8 seats · 4 rows/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /^Configure seat 4A\b/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Configure seat 4F\b/i })).toBeInTheDocument();
    },
    15_000,
  );

  it('shows an error when the aircraft cannot be loaded', async () => {
    renderSeatConfigPage('missing-aircraft');

    expect(
      await screen.findByText('Unable to load aircraft', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
  });
});
