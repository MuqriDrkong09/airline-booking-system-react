import { act } from '@testing-library/react';
import {
  completeBookingAfterPayment,
  createBooking,
  generateBookingReference,
  useBookingStore,
  useBookingsStore,
  validateCheckoutForBooking,
  type BookingData,
} from '@/features/booking';
import type { FlightOffer } from '@/features/flights';
import type { PassengerDraft } from '@/features/passengers';
import { usePassengerDraftStore } from '@/features/passengers';
import { useSeatSelectionStore } from '@/features/seats';

const flight = {
  id: 'FL-100',
  airline: { code: 'AB', name: 'AeroBook Air' },
  flightNumber: 'AB100',
  aircraft: { model: 'A320' },
  origin: { code: 'KUL', city: 'Kuala Lumpur', airportName: 'KLIA' },
  destination: { code: 'NRT', city: 'Tokyo', airportName: 'Narita' },
  departureTime: '2026-10-20T09:00',
  arrivalTime: '2026-10-20T17:00',
  durationMinutes: 420,
  stops: 0,
  stopAirports: [],
  cabinClass: 'ECONOMY',
  baggage: { cabinKg: 7, checkedKg: 20, pieces: 1 },
  amenities: { meals: 'Hot meal', wifi: true, wifiNotes: '', seatInformation: '' },
  policies: { refundPolicy: '', changePolicy: '', fareConditions: [] },
  segments: [],
  price: { amount: 200, currency: 'USD' },
  availableSeats: 10,
  refundable: true,
  baggageIncluded: true,
} as FlightOffer;

const adult: PassengerDraft = {
  id: 'adult-1',
  type: 'ADULT',
  title: 'Ms',
  firstName: 'Ada',
  lastName: 'Lovelace',
  dateOfBirth: '1990-01-01',
  gender: 'FEMALE',
  nationality: 'MY',
  passportNumber: 'A123',
  passportExpiry: '2030-01-01',
  email: 'ada@example.com',
  phone: '+60123456789',
  associatedAdultId: '',
};

function seedValidDraft() {
  act(() => {
    useBookingStore.getState().clearBooking();
    useBookingsStore.getState().clearBookings();
    usePassengerDraftStore.getState().clearDraft();
    useSeatSelectionStore.getState().clearSelection();

    useBookingStore.getState().setSelectedFlight(flight, 'ECONOMY');
    useBookingStore.getState().setPassengers([adult]);
    useBookingStore.getState().setSeats([
      { passengerId: 'adult-1', seatId: '10A', label: '10A', price: 25 },
    ]);
    useBookingStore.getState().setBaggage({
      flightId: 'FL-100',
      cabinClass: 'ECONOMY',
      baggage: [
        {
          passengerId: 'adult-1',
          cabinKg: 7,
          checkedKg: 20,
          additionalKg: 0,
        },
      ],
      baggageTotal: 0,
    });
    useBookingStore.getState().setMeals({
      flightId: 'FL-100',
      meals: [{ passengerId: 'adult-1', mealType: null, quantity: 0 }],
      mealTotal: 0,
    });
    useBookingStore.getState().setAddons({
      flightId: 'FL-100',
      addons: [],
      addonTotal: 0,
    });
    useBookingStore.getState().setPayment({
      method: 'CREDIT_CARD',
      billingName: 'Ada Lovelace',
      billingEmail: 'ada@example.com',
      cardBrand: 'visa',
      cardLast4: '1111',
    });
  });
}

describe('booking creation flow', () => {
  beforeEach(() => {
    seedValidDraft();
  });

  it('validates a complete checkout draft', () => {
    const draft = useBookingStore.getState() as BookingData;
    expect(validateCheckoutForBooking(draft)).toEqual({ ok: true });
  });

  it('rejects checkout without seats for adults', () => {
    act(() => {
      useBookingStore.getState().setSeats([]);
    });
    const result = validateCheckoutForBooking(useBookingStore.getState());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.step).toBe('seats');
    }
  });

  it('creates a strongly typed CONFIRMED booking with a reference', () => {
    const draft = useBookingStore.getState();
    const booking = createBooking({
      draft,
      payment: draft.payment!,
      transactionId: 'TXN-TEST-1',
      reference: generateBookingReference('TXN-TEST-1'),
    });

    expect(booking.status).toBe('CONFIRMED');
    expect(booking.reference).toMatch(/^AB-/);
    expect(booking.flightId).toBe('FL-100');
    expect(booking.passengers).toHaveLength(1);
    expect(booking.payment).not.toHaveProperty('cardNumber');
    expect(booking.transactionId).toBe('TXN-TEST-1');
  });

  it('saves the booking, clears temporary state, and returns the record', () => {
    const payment = useBookingStore.getState().payment!;
    const result = completeBookingAfterPayment({
      transactionId: 'TXN-FLOW-1',
      payment,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(useBookingsStore.getState().bookings).toHaveLength(1);
    expect(useBookingsStore.getState().bookings[0]?.reference).toBe(result.booking.reference);
    expect(useBookingStore.getState().selectedFlight).toBeNull();
    expect(useBookingStore.getState().passengers).toEqual([]);
    expect(usePassengerDraftStore.getState().passengers).toEqual([]);
  });
});
