import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryClient } from '@/app/providers/queryClient';
import {
  adminAircraftApi,
  adminAircraftKeys,
  AdminAircraftView,
  mockAdminAircraftApi,
  type AircraftFormParsedValues,
} from '@/features/adminAircraft';
import { renderWithProviders } from '@tests/utils/test-utils';

const closedDialogSubmitValues: AircraftFormParsedValues = {
  manufacturer: 'Embraer',
  model: 'E190',
  registration: '9M-TST',
  totalSeats: 100,
  economySeats: 96,
  premiumEconomySeats: 0,
  businessSeats: 4,
  firstClassSeats: 0,
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

jest.mock('@/features/adminAircraft/components/AircraftDialog', () => ({
  AircraftDialog: ({
    onSubmit,
  }: {
    onSubmit: (values: AircraftFormParsedValues) => void | Promise<void>;
  }) => (
    <button type="button" onClick={() => void onSubmit(closedDialogSubmitValues)}>
      Force aircraft submit
    </button>
  ),
}));

describe('AdminAircraftView guards', () => {
  beforeEach(() => {
    mockAdminAircraftApi.reset();
    queryClient.removeQueries({ queryKey: adminAircraftKeys.all });
    jest.restoreAllMocks();
  });

  it('ignores delete confirmation when no aircraft is selected', async () => {
    const user = userEvent.setup({ delay: null });
    const deleteSpy = jest.spyOn(adminAircraftApi, 'deleteAircraft');

    renderWithProviders(<AdminAircraftView />);

    expect(await screen.findByText('9M-AAA')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Force confirm delete' }));

    await waitFor(() => {
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });

  it('ignores form submit when the dialog is closed', async () => {
    const user = userEvent.setup({ delay: null });
    const createSpy = jest.spyOn(adminAircraftApi, 'createAircraft');
    const updateSpy = jest.spyOn(adminAircraftApi, 'updateAircraft');

    renderWithProviders(<AdminAircraftView />);
    expect(await screen.findByText('9M-AAA')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Force aircraft submit' }));

    await waitFor(() => {
      expect(createSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
    });
  });
});
