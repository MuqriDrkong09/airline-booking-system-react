import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { queryClient } from '@/app/providers/queryClient';
import { useBookingStore, useBookingsStore } from '@/features/booking';
import { usePassengerDraftStore } from '@/features/passengers';
import { MOCK_SUCCESS_CARD_NUMBER } from '@/features/payment';
import { createAircraftSeatMap, useSeatSelectionStore } from '@/features/seats';
import { AddonSelectionPage } from '@/pages/customer/AddonSelectionPage';
import { BaggageSelectionPage } from '@/pages/customer/BaggageSelectionPage';
import { BookingConfirmationPage } from '@/pages/customer/BookingConfirmationPage';
import { BookingSummaryPage } from '@/pages/customer/BookingSummaryPage';
import { FlightDetailsPage } from '@/pages/customer/FlightDetailsPage';
import { MealSelectionPage } from '@/pages/customer/MealSelectionPage';
import { PassengerDetailsPage } from '@/pages/customer/PassengerDetailsPage';
import { PaymentPage } from '@/pages/customer/PaymentPage';
import { SearchFlightsPage } from '@/pages/customer/SearchFlightsPage';
import { SeatSelectionPage } from '@/pages/customer/SeatSelectionPage';
import { renderWithProviders } from '@tests/utils/test-utils';

const SEARCH_QUERY =
  'from=KUL&to=NRT&departure=2026-10-20&adults=1&children=0&infants=0&cabin=ECONOMY';

function BookingFlowRoutes() {
  return (
    <Routes>
      <Route path="/app/flights" element={<SearchFlightsPage />} />
      <Route path="/app/flights/:flightId" element={<FlightDetailsPage />} />
      <Route path="/app/flights/:flightId/passengers" element={<PassengerDetailsPage />} />
      <Route path="/app/flights/:flightId/seats" element={<SeatSelectionPage />} />
      <Route path="/app/flights/:flightId/baggage" element={<BaggageSelectionPage />} />
      <Route path="/app/flights/:flightId/meals" element={<MealSelectionPage />} />
      <Route path="/app/flights/:flightId/addons" element={<AddonSelectionPage />} />
      <Route path="/app/flights/:flightId/summary" element={<BookingSummaryPage />} />
      <Route path="/app/flights/:flightId/payment" element={<PaymentPage />} />
      <Route
        path="/app/bookings/:bookingReference/confirmation"
        element={<BookingConfirmationPage />}
      />
    </Routes>
  );
}

async function pickAirport(
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp,
  query: string,
  optionName: RegExp,
) {
  const input = screen.getByLabelText(label);
  await user.clear(input);
  await user.type(input, query);
  await user.click(await screen.findByRole('option', { name: optionName }));
}

async function chooseOption(
  user: ReturnType<typeof userEvent.setup>,
  comboboxName: RegExp,
  optionName: string,
) {
  await user.click(screen.getByRole('combobox', { name: comboboxName }));
  await user.click(await screen.findByRole('option', { name: optionName }));
}

function setInputValue(element: HTMLElement, value: string) {
  fireEvent.change(element, { target: { value } });
}

async function fillAdultPassenger(user: ReturnType<typeof userEvent.setup>) {
  await chooseOption(user, /^Title$/i, 'Mr');
  setInputValue(document.getElementById('passenger-0-first-name')!, 'Alex');
  setInputValue(document.getElementById('passenger-0-last-name')!, 'Traveler');
  setInputValue(document.getElementById('passenger-0-dob')!, '1990-06-15');

  await chooseOption(user, /^Gender$/i, 'Male');
  await chooseOption(user, /^Nationality$/i, 'Malaysia');

  setInputValue(document.getElementById('passenger-0-passport-number')!, 'A1234567');
  setInputValue(document.getElementById('passenger-0-passport-expiry')!, '2028-01-01');
  setInputValue(document.getElementById('passenger-0-email')!, 'alex@example.com');
  setInputValue(document.getElementById('passenger-0-phone')!, '+60 12 345 6789');
}

function resetBookingFlowStores() {
  act(() => {
    useBookingStore.getState().clearBooking();
    void useBookingStore.persist.clearStorage();
    useBookingsStore.getState().clearBookings();
    void useBookingsStore.persist.clearStorage();
    usePassengerDraftStore.getState().clearDraft();
    void usePassengerDraftStore.persist.clearStorage();
    useSeatSelectionStore.getState().clearSelection();
  });
  queryClient.clear();
}

describe('customer booking flow (integration)', () => {
  beforeEach(() => {
    resetBookingFlowStores();
  });

  afterEach(() => {
    resetBookingFlowStores();
  });

  it('searches via the form and shows matching flight results', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<BookingFlowRoutes />, {
      initialEntries: ['/app/flights'],
    });

    expect(screen.getByRole('heading', { name: 'Search flights' })).toBeInTheDocument();

    await pickAirport(user, /^From/i, 'KUL', /KUL — Kuala Lumpur International Airport/i);
    await pickAirport(user, /^To/i, 'NRT', /NRT — Narita International Airport/i);
    setInputValue(screen.getByLabelText(/Departure date/i), '2026-10-20');
    await user.click(screen.getByRole('button', { name: 'Search flights' }));

    expect(await screen.findByText(/Available flights/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/KUL/);
      expect(screen.getByRole('alert')).toHaveTextContent(/NRT/);
    });
    expect(screen.getAllByRole('button', { name: 'Select' }).length).toBeGreaterThan(0);
  }, 30_000);

  it('walks search → confirmation while preserving booking state', async () => {
    const user = userEvent.setup({ delay: null });

    // Hydrated search URL triggers the same mock search path without slow airport typing.
    renderWithProviders(<BookingFlowRoutes />, {
      initialEntries: [`/app/flights?${SEARCH_QUERY}`],
    });

    expect(await screen.findByText(/Available flights/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/KUL/);
      expect(screen.getByRole('alert')).toHaveTextContent(/NRT/);
    });

    const selectButtons = await screen.findAllByRole('button', { name: 'Select' });
    expect(selectButtons.length).toBeGreaterThan(0);

    // --- Select flight (results → details → confirm) ---
    await user.click(selectButtons[0]!);

    expect(await screen.findByRole('heading', { name: 'Flight details' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Select Flight' }));

    expect(await screen.findByRole('heading', { name: 'Passenger details' })).toBeInTheDocument();

    const selectedFlightId = useBookingStore.getState().selectedFlight?.id;
    expect(selectedFlightId).toBeTruthy();
    expect(useBookingStore.getState().searchCriteria).toEqual(
      expect.objectContaining({
        from: 'KUL',
        to: 'NRT',
        departure: '2026-10-20',
        adults: 1,
        cabinClass: 'ECONOMY',
      }),
    );
    expect(useBookingStore.getState().selectedFlight?.origin.code).toBe('KUL');
    expect(useBookingStore.getState().selectedFlight?.destination.code).toBe('NRT');

    // --- Enter passenger details ---
    expect(screen.getByRole('alert')).toHaveTextContent(/International flight/i);
    await fillAdultPassenger(user);
    await user.click(screen.getByRole('button', { name: 'Save passengers' }));

    expect(await screen.findByRole('heading', { name: 'Select seats' })).toBeInTheDocument();

    expect(useBookingStore.getState().passengers).toHaveLength(1);
    expect(useBookingStore.getState().passengers[0]).toEqual(
      expect.objectContaining({
        firstName: 'Alex',
        lastName: 'Traveler',
        email: 'alex@example.com',
        passportNumber: 'A1234567',
      }),
    );
    expect(usePassengerDraftStore.getState().passengers[0]?.firstName).toBe('Alex');
    expect(useBookingStore.getState().selectedFlight?.id).toBe(selectedFlightId);

    // --- Select seats ---
    expect(await screen.findByRole('group', { name: /seat map/i })).toBeInTheDocument();

    const availableSeat = createAircraftSeatMap('Airbus A320').seats.find(
      (seat) => seat.status === 'AVAILABLE',
    );
    expect(availableSeat).toBeDefined();

    await user.click(
      screen.getByRole('button', { name: new RegExp(`Seat ${availableSeat!.label}`, 'i') }),
    );
    await user.click(screen.getByRole('button', { name: 'Save seat selection' }));

    expect(await screen.findByRole('heading', { name: 'Baggage' })).toBeInTheDocument();

    expect(useBookingStore.getState().seats).toEqual([
      expect.objectContaining({
        passengerId: 'adult-1',
        seatId: availableSeat!.id,
        label: availableSeat!.label,
      }),
    ]);
    expect(useBookingStore.getState().passengers[0]?.firstName).toBe('Alex');
    expect(useBookingStore.getState().selectedFlight?.id).toBe(selectedFlightId);

    // --- Select baggage ---
    const checkedGroup = screen.getByRole('radiogroup', {
      name: /Alex Traveler checked baggage/i,
    });
    await user.click(within(checkedGroup).getByRole('radio', { name: /20KG/i }));
    await user.click(screen.getByRole('button', { name: /Save baggage/i }));

    expect(await screen.findByRole('heading', { name: 'Meals' })).toBeInTheDocument();

    expect(useBookingStore.getState().baggage).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          passengerId: 'adult-1',
          cabinKg: 7,
          checkedKg: 20,
        }),
      ]),
    );
    expect(useBookingStore.getState().seats[0]?.label).toBe(availableSeat!.label);
    expect(useBookingStore.getState().passengers[0]?.lastName).toBe('Traveler');

    // --- Meals (routed step between baggage and add-ons) ---
    await user.click(screen.getByRole('button', { name: /Save meals/i }));

    expect(await screen.findByRole('heading', { name: 'Add-ons' })).toBeInTheDocument();

    expect(useBookingStore.getState().meals).toEqual(
      expect.arrayContaining([expect.objectContaining({ passengerId: 'adult-1', mealType: null })]),
    );
    expect(useBookingStore.getState().baggage[0]?.checkedKg).toBe(20);

    // --- Select add-ons ---
    const priorityHeading = screen.getByText('Priority boarding');
    const priorityCard = priorityHeading.closest('.MuiCard-root');
    expect(priorityCard).toBeTruthy();
    await user.click(within(priorityCard as HTMLElement).getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: /Save add-ons/i }));

    expect(await screen.findByRole('heading', { name: 'Booking summary' })).toBeInTheDocument();

    expect(useBookingStore.getState().addons).toEqual([
      { addonId: 'priority-boarding', passengerId: 'adult-1' },
    ]);
    expect(useBookingStore.getState().addonTotal).toBe(18);
    expect(useBookingStore.getState().selectedFlight?.id).toBe(selectedFlightId);
    expect(useBookingStore.getState().passengers[0]?.email).toBe('alex@example.com');
    expect(useBookingStore.getState().seats[0]?.label).toBe(availableSeat!.label);
    expect(useBookingStore.getState().baggage[0]?.checkedKg).toBe(20);

    // --- Apply promo + review booking ---
    expect(await screen.findByLabelText('Promo code')).toBeInTheDocument();

    const subtotalBeforePromo = useBookingStore.getState().priceBreakdown.subtotal;
    expect(subtotalBeforePromo).toBeGreaterThanOrEqual(150);

    setInputValue(screen.getByLabelText('Promo code'), 'FLIGHT100');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(await screen.findByText(/Promo applied/i)).toBeInTheDocument();

    const breakdownAfterPromo = useBookingStore.getState().priceBreakdown;
    expect(useBookingStore.getState().promoCode?.code).toBe('FLIGHT100');
    expect(breakdownAfterPromo.discount).toBe(100);
    expect(breakdownAfterPromo.taxes).toBeGreaterThan(0);
    expect(breakdownAfterPromo.finalTotal).toBeGreaterThan(0);
    expect(breakdownAfterPromo.finalTotal).toBeLessThan(breakdownAfterPromo.subtotal);
    expect(useBookingStore.getState().addons).toEqual([
      { addonId: 'priority-boarding', passengerId: 'adult-1' },
    ]);
    expect(useBookingStore.getState().passengers[0]?.firstName).toBe('Alex');

    await user.click(screen.getByLabelText('Confirm booking details before payment'));
    await user.click(screen.getByRole('link', { name: 'Continue to payment' }));

    expect(await screen.findByRole('heading', { name: 'Payment' })).toBeInTheDocument();

    // Promo and trip details must still be present on the payment step.
    expect(useBookingStore.getState().promoCode?.code).toBe('FLIGHT100');
    expect(useBookingStore.getState().selectedFlight?.id).toBe(selectedFlightId);
    expect(useBookingStore.getState().seats[0]?.label).toBe(availableSeat!.label);
    expect(useBookingStore.getState().baggage[0]?.checkedKg).toBe(20);
    expect(useBookingStore.getState().addons[0]?.addonId).toBe('priority-boarding');

    const finalTotal = useBookingStore.getState().priceBreakdown.finalTotal;
    expect(finalTotal).toBeGreaterThan(0);

    // --- Mock payment ---
    setInputValue(screen.getByLabelText('Card number'), MOCK_SUCCESS_CARD_NUMBER);
    setInputValue(screen.getByLabelText('Cardholder name'), 'Alex Traveler');
    setInputValue(screen.getByLabelText('Expiry date'), '12/30');
    setInputValue(screen.getByLabelText('CVV'), '123');

    await user.click(screen.getByRole('button', { name: /^Pay\s/i }));

    // --- Booking confirmation ---
    expect(
      await screen.findByRole('heading', { name: 'Booking confirmation' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Your payment was successful/i)).toBeInTheDocument();

    const confirmed = useBookingsStore.getState().bookings;
    expect(confirmed).toHaveLength(1);
    const booking = confirmed[0]!;
    expect(booking.status).toBe('CONFIRMED');
    expect(booking.flight.id).toBe(selectedFlightId);
    expect(booking.passengers[0]).toEqual(
      expect.objectContaining({ firstName: 'Alex', lastName: 'Traveler' }),
    );
    expect(booking.seats[0]).toEqual(
      expect.objectContaining({ label: availableSeat!.label, passengerId: 'adult-1' }),
    );
    expect(booking.baggage[0]).toEqual(
      expect.objectContaining({ passengerId: 'adult-1', checkedKg: 20 }),
    );
    expect(booking.addons).toEqual([{ addonId: 'priority-boarding', passengerId: 'adult-1' }]);
    expect(booking.promoCode?.code).toBe('FLIGHT100');
    expect(booking.priceBreakdown.discount).toBe(100);
    expect(booking.payment?.cardLast4).toBe('1111');
    expect(booking.payment).not.toHaveProperty('cardNumber');

    expect(screen.getByText(booking.reference)).toBeInTheDocument();
    expect(screen.getAllByText(/Alex Traveler/i).length).toBeGreaterThan(0);

    // Draft booking is cleared after successful payment; history holds the confirmed booking.
    expect(useBookingStore.getState().selectedFlight).toBeNull();
    expect(useBookingStore.getState().passengers).toEqual([]);
  }, 45_000);

  it('keeps search criteria in the URL across early booking steps', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<BookingFlowRoutes />, {
      initialEntries: [`/app/flights?${SEARCH_QUERY}`],
    });

    expect(await screen.findByText(/Available flights/i)).toBeInTheDocument();
    await user.click((await screen.findAllByRole('button', { name: 'Select' }))[0]!);

    expect(await screen.findByRole('heading', { name: 'Flight details' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Select Flight' }));

    expect(await screen.findByRole('heading', { name: 'Passenger details' })).toBeInTheDocument();
    expect(screen.getByText(/KUL → NRT/i)).toBeInTheDocument();
    expect(useBookingStore.getState().searchCriteria).toEqual(
      expect.objectContaining({
        from: 'KUL',
        to: 'NRT',
        departure: '2026-10-20',
        adults: 1,
      }),
    );
  }, 30_000);
});
