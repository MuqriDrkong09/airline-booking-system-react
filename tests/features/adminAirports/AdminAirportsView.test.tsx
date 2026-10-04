import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryClient } from '@/app/providers/queryClient';
import {
  adminAirportKeys,
  adminAirportsApi,
  AdminAirportsView,
  mockAdminAirportsApi,
} from '@/features/adminAirports';
import type { AirportFormParsedValues } from '@/features/adminAirports';
import { renderWithProviders } from '@tests/utils/test-utils';

const closedDialogSubmitValues: AirportFormParsedValues = {
  code: 'TST',
  name: 'Test Airport',
  city: 'Test City',
  country: 'Test Country',
  timezone: 'Asia/Kuala_Lumpur',
  terminals: 1,
  latitude: 1,
  longitude: 1,
  active: true,
};

jest.mock('@/components/common', () => {
  const actual = jest.requireActual<typeof import('@/components/common')>('@/components/common');

  return {
    ...actual,
    ConfirmDialog: ({ onConfirm }: { onConfirm: () => void }) => (
      <button type="button" onClick={onConfirm}>
        Force confirm delete
      </button>
    ),
  };
});

jest.mock('@/features/adminAirports/components/AirportDialog', () => ({
  AirportDialog: ({
    onSubmit,
  }: {
    onSubmit: (values: AirportFormParsedValues) => void | Promise<void>;
  }) => (
    <button type="button" onClick={() => void onSubmit(closedDialogSubmitValues)}>
      Force airport submit
    </button>
  ),
}));

describe('AdminAirportsView', () => {
  beforeEach(() => {
    mockAdminAirportsApi.reset();
    queryClient.removeQueries({ queryKey: adminAirportKeys.all });
    jest.restoreAllMocks();
  });

  it('ignores delete confirmation when no airport is selected', async () => {
    const user = userEvent.setup({ delay: null });
    const deleteSpy = jest.spyOn(adminAirportsApi, 'deleteAirport');

    renderWithProviders(<AdminAirportsView />);

    expect(await screen.findByText('KUL')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Force confirm delete' }));

    await waitFor(() => {
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });

  it('renders an empty list when query data is null', async () => {
    jest.spyOn(adminAirportsApi, 'listAirports').mockResolvedValue(null as never);

    renderWithProviders(<AdminAirportsView />);

    expect(await screen.findByText('No airports found')).toBeInTheDocument();
    expect(screen.getByText('0 airports')).toBeInTheDocument();
  });

  it('ignores form submit when the dialog is closed', async () => {
    const user = userEvent.setup({ delay: null });
    const createSpy = jest.spyOn(adminAirportsApi, 'createAirport');
    const updateSpy = jest.spyOn(adminAirportsApi, 'updateAirport');

    renderWithProviders(<AdminAirportsView />);
    expect(await screen.findByText('KUL')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Force airport submit' }));

    await waitFor(() => {
      expect(createSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
    });
  });
});
