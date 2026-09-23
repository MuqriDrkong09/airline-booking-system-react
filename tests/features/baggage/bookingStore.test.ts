import { act } from '@testing-library/react';
import {
  selectDiscount,
  selectFinalTotal,
  selectSubtotal,
  selectTaxes,
  selectTotalAddonCost,
  selectTotalBaggageCost,
  selectTotalMealCost,
  selectTotalPassengers,
  selectTotalSeatCost,
  toSafePaymentInfo,
  useBookingStore,
} from '@/features/booking';
import type { FlightOffer } from '@/features/flights';
import type { PassengerDraft } from '@/features/passengers';

const flight = {
  id: 'FL-100',
  airline: { code: 'AB', name: 'AeroBook Air' },
  flightNumber: 'AB100',
  aircraft: { model: 'A320' },
  origin: {
    code: 'KUL',
    city: 'Kuala Lumpur',
    airportName: 'KLIA',
  },
  destination: {
    code: 'NRT',
    city: 'Tokyo',
    airportName: 'Narita',
  },
  departureTime: '2026-10-20T09:00',
  arrivalTime: '2026-10-20T17:00',
  durationMinutes: 420,
  stops: 0,
  stopAirports: [],
  cabinClass: 'ECONOMY',
  baggage: { cabinKg: 7, checkedKg: 20, pieces: 1 },
  amenities: {
    meals: 'Hot meal',
    wifi: true,
    wifiNotes: '',
    seatInformation: '',
  },
  policies: {
    refundPolicy: '',
    changePolicy: '',
    fareConditions: [],
  },
  segments: [],
  price: { amount: 100, currency: 'USD' },
  availableSeats: 10,
  refundable: true,
  baggageIncluded: true,
} as FlightOffer;

const adult: PassengerDraft = {
  id: 'adult-1',
  type: 'ADULT',
  title: 'Mr',
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

describe('booking store', () => {
  beforeEach(() => {
    act(() => {
      useBookingStore.getState().clearBooking();
      void useBookingStore.persist.clearStorage();
    });
  });

  it('updates booking state when baggage changes', () => {
    act(() => {
      useBookingStore.getState().setBaggage({
        flightId: 'FL-100',
        cabinClass: 'ECONOMY',
        baggage: [
          {
            passengerId: 'adult-1',
            cabinKg: 7,
            checkedKg: 30,
            additionalKg: 0,
          },
        ],
        baggageTotal: 55,
      });
    });

    const state = useBookingStore.getState();
    expect(state.flightId).toBe('FL-100');
    expect(state.baggageTotal).toBe(55);
    expect(state.baggage[0]?.checkedKg).toBe(30);
    expect(state.updatedAt).toEqual(expect.any(String));
  });

  it('updates booking state when meals change', () => {
    act(() => {
      useBookingStore.getState().setMeals({
        flightId: 'FL-100',
        meals: [{ passengerId: 'adult-1', mealType: 'VEGAN', quantity: 2 }],
        mealTotal: 10,
      });
    });

    const state = useBookingStore.getState();
    expect(state.flightId).toBe('FL-100');
    expect(state.mealTotal).toBe(10);
    expect(state.meals[0]?.mealType).toBe('VEGAN');
  });

  it('updates add-ons and recalculates the price breakdown', () => {
    act(() => {
      useBookingStore.getState().setBaggage({
        flightId: 'FL-100',
        cabinClass: 'ECONOMY',
        baggage: [],
        baggageTotal: 55,
      });
      useBookingStore.getState().setMeals({
        flightId: 'FL-100',
        meals: [],
        mealTotal: 10,
      });
      useBookingStore.getState().setAddons({
        flightId: 'FL-100',
        addons: [{ addonId: 'priority-boarding', passengerId: 'adult-1' }],
        addonTotal: 18,
      });
    });

    const state = useBookingStore.getState();
    expect(state.addons).toHaveLength(1);
    expect(selectTotalAddonCost(state)).toBe(18);
    expect(selectSubtotal(state)).toBe(83);
  });

  it('centralizes search, flight, passengers, seats, promo, and selectors', () => {
    act(() => {
      useBookingStore.getState().setSearchCriteria({
        tripType: 'ONE_WAY',
        from: 'KUL',
        to: 'NRT',
        departure: '2026-10-20',
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: 'ECONOMY',
      });
      useBookingStore.getState().setSelectedFlight(flight);
      useBookingStore.getState().setPassengers([adult]);
      useBookingStore.getState().setSeats([
        { passengerId: 'adult-1', seatId: 'economy-10A', label: '10A', price: 35 },
      ]);
      useBookingStore.getState().setBaggage({
        flightId: 'FL-100',
        cabinClass: 'ECONOMY',
        baggage: [],
        baggageTotal: 20,
      });
      useBookingStore.getState().setMeals({
        flightId: 'FL-100',
        meals: [{ passengerId: 'adult-1', mealType: 'VEGAN', quantity: 1 }],
        mealTotal: 5,
      });
      useBookingStore.getState().setAddons({
        flightId: 'FL-100',
        addons: [{ addonId: 'priority-boarding', passengerId: 'adult-1' }],
        addonTotal: 18,
      });
      useBookingStore.getState().setPromoCode({
        code: 'SAVE10',
        discountType: 'PERCENT',
        discountValue: 10,
      });
      useBookingStore.getState().setBookingReference('AB-REF-001');
      useBookingStore.getState().setBookingStatus('PENDING_PAYMENT');
    });

    const state = useBookingStore.getState();
    expect(selectTotalPassengers(state)).toBe(1);
    expect(selectTotalSeatCost(state)).toBe(35);
    expect(selectTotalBaggageCost(state)).toBe(20);
    expect(selectTotalMealCost(state)).toBe(5);
    expect(selectTotalAddonCost(state)).toBe(18);
    // base 100 + 35 + 20 + 5 + 18 = 178
    expect(selectSubtotal(state)).toBe(178);
    expect(selectDiscount(state)).toBe(17.8);
    expect(selectTaxes(state)).toBeCloseTo(12.82, 2);
    expect(selectFinalTotal(state)).toBeCloseTo(173.02, 2);
    expect(state.bookingReference).toBe('AB-REF-001');
    expect(state.bookingStatus).toBe('PENDING_PAYMENT');
  });

  it('stores only safe payment fields and strips sensitive card data', () => {
    act(() => {
      useBookingStore.getState().setPayment({
        method: 'CARD',
        billingName: 'Ada Lovelace',
        billingEmail: 'ada@example.com',
        cardBrand: 'visa',
        cardLast4: '4242',
        cardNumber: '4111111111111111',
        cvv: '123',
        expiry: '12/30',
      });
    });

    const payment = useBookingStore.getState().payment;
    expect(payment).toEqual({
      method: 'CARD',
      billingName: 'Ada Lovelace',
      billingEmail: 'ada@example.com',
      cardBrand: 'visa',
      cardLast4: '4242',
    });
    expect(payment).not.toHaveProperty('cardNumber');
    expect(payment).not.toHaveProperty('cvv');

    const persisted = useBookingStore.persist.getOptions().partialize?.(
      useBookingStore.getState(),
    ) as { payment: unknown };
    expect(JSON.stringify(persisted.payment)).not.toMatch(/4111111111111111|cvv|12\/30/i);
  });

  it('sanitizes payment payloads before persistence helpers run', () => {
    expect(
      toSafePaymentInfo({
        method: 'CARD',
        cardLast4: '00004242',
        cardNumber: '4111111111111111',
        cvv: '999',
      }),
    ).toEqual({
      method: 'CARD',
      billingName: '',
      billingEmail: '',
      cardBrand: '',
      cardLast4: '4242',
    });
  });
});
