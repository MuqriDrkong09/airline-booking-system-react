import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PassengerForm, usePassengerDraftStore } from '@/features/passengers';
import { renderWithProviders } from '@tests/utils/test-utils';

async function chooseOption(
  user: ReturnType<typeof userEvent.setup>,
  comboboxName: RegExp,
  optionName: string,
) {
  await user.click(screen.getByRole('combobox', { name: comboboxName }));
  await user.click(await screen.findByRole('option', { name: optionName }));
}

async function fillAdultBasics(
  user: ReturnType<typeof userEvent.setup>,
  options: { requiresPassport?: boolean; index?: number } = {},
) {
  const index = options.index ?? 0;

  await chooseOption(user, /^Title$/i, 'Mr');
  await user.type(document.getElementById(`passenger-${index}-first-name`)!, 'Alex');
  await user.type(document.getElementById(`passenger-${index}-last-name`)!, 'Traveler');

  const dob = document.getElementById(`passenger-${index}-dob`) as HTMLInputElement;
  await user.type(dob, '1990-06-15');

  await chooseOption(user, /^Gender$/i, 'Male');
  await chooseOption(user, /^Nationality$/i, 'Malaysia');

  if (options.requiresPassport !== false) {
    await user.type(document.getElementById(`passenger-${index}-passport-number`)!, 'A1234567');
    const expiry = document.getElementById(
      `passenger-${index}-passport-expiry`,
    ) as HTMLInputElement;
    await user.type(expiry, '2028-01-01');
  }

  await user.type(document.getElementById(`passenger-${index}-email`)!, 'alex@example.com');
  await user.type(document.getElementById(`passenger-${index}-phone`)!, '+60 12 345 6789');
}

describe('PassengerForm', () => {
  beforeEach(() => {
    usePassengerDraftStore.getState().clearDraft();
    usePassengerDraftStore.persist.clearStorage();
    usePassengerDraftStore.getState().initTrip({
      flightId: 'flt-kul-sin-1',
      from: 'KUL',
      to: 'SIN',
      departure: '2026-10-20',
      counts: { adults: 1, children: 0, infants: 0 },
      requiresPassport: true,
    });
  });

  it('shows validation errors when required adult fields are empty', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <PassengerForm
        counts={{ adults: 1, children: 0, infants: 0 }}
        departureDate="2026-10-20"
        requiresPassport
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save passengers' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(usePassengerDraftStore.getState().saveStatus).not.toBe('saved');
  }, 15000);

  it('saves a valid adult and shows success state', async () => {
    const user = userEvent.setup({ delay: null });
    const onSaved = jest.fn();

    renderWithProviders(
      <PassengerForm
        counts={{ adults: 1, children: 0, infants: 0 }}
        departureDate="2026-10-20"
        requiresPassport
        onSaved={onSaved}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/International flight/i);
    await fillAdultBasics(user);
    await user.click(screen.getByRole('button', { name: 'Save passengers' }));

    await waitFor(() => {
      expect(screen.getByText(/Passengers saved/i)).toBeInTheDocument();
    });
    expect(onSaved).toHaveBeenCalled();
    expect(usePassengerDraftStore.getState().passengers[0]?.firstName).toBe('Alex');
    expect(usePassengerDraftStore.getState().saveStatus).toBe('saved');
  }, 20000);

  it('requires an adult association when an infant is present', async () => {
    usePassengerDraftStore.getState().initTrip({
      flightId: 'flt-kul-sin-1',
      from: 'KUL',
      to: 'SIN',
      departure: '2026-10-20',
      counts: { adults: 1, children: 0, infants: 1 },
      requiresPassport: true,
    });

    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <PassengerForm
        counts={{ adults: 1, children: 0, infants: 1 }}
        departureDate="2026-10-20"
        requiresPassport
      />,
    );

    expect(screen.getByText(/^Infant 1$/i)).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /Traveling with adult/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save passengers' }));

    expect(
      await screen.findByText('Select an adult traveling with this infant'),
    ).toBeInTheDocument();
  }, 15000);

  it('marks passport optional on domestic routes', () => {
    usePassengerDraftStore.getState().initTrip({
      flightId: 'flt-kul-pen-1',
      from: 'KUL',
      to: 'PEN',
      departure: '2026-10-20',
      counts: { adults: 1, children: 0, infants: 0 },
      requiresPassport: false,
    });

    renderWithProviders(
      <PassengerForm
        counts={{ adults: 1, children: 0, infants: 0 }}
        departureDate="2026-10-20"
        requiresPassport={false}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/Domestic flight/i);
    expect(screen.getByText(/Optional for this domestic route/i)).toBeInTheDocument();
  });
});
