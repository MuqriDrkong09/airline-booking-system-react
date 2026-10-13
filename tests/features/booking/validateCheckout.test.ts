import type { BookingData } from '@/features/booking';
import { EMPTY_PRICE_BREAKDOWN } from '@/features/booking';
import {
  validateBookingAddons,
  validateBookingBaggage,
  validateBookingPassengers,
  validateBookingPayment,
  validateBookingSeats,
  validateBookingState,
  validateCheckoutForBooking,
} from '@/features/booking/utils/validateCheckout';
import type { FlightOffer } from '@/features/flights';
import type { PassengerDraft } from '@/features/passengers';

const flight = {
  id: 'FL-100',
  price: { amount: 200, currency: 'USD' },
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

const infant: PassengerDraft = {
  id: 'infant-1',
  type: 'INFANT',
  title: 'Ms',
  firstName: 'Grace',
  lastName: 'Hopper',
  dateOfBirth: '2025-01-01',
  gender: 'FEMALE',
  nationality: 'MY',
  passportNumber: '',
  passportExpiry: '',
  email: '',
  phone: '',
  associatedAdultId: 'adult-1',
};

function makeDraft(overrides: Partial<BookingData> = {}): BookingData {
  return {
    flightId: flight.id,
    cabinClass: 'ECONOMY',
    selectedFlight: flight,
    searchCriteria: null,
    passengers: [adult],
    seats: [{ passengerId: 'adult-1', seatId: '10A', label: '10A', price: 25 }],
    baggage: [{ passengerId: 'adult-1', cabinKg: 7, checkedKg: 20, additionalKg: 0 }],
    seatTotal: 25,
    baggageTotal: 0,
    meals: [],
    mealTotal: 0,
    addons: [],
    addonTotal: 0,
    promoCode: null,
    payment: {
      method: 'CREDIT_CARD',
      billingName: 'Ada',
      billingEmail: 'ada@example.com',
      cardBrand: 'visa',
      cardLast4: '1111',
    },
    priceBreakdown: {
      ...EMPTY_PRICE_BREAKDOWN,
      currency: 'USD',
      baseFare: 200,
      seatCost: 25,
      subtotal: 225,
      taxes: 18,
      finalTotal: 243,
    },
    bookingReference: null,
    bookingStatus: 'DRAFT',
    updatedAt: null,
    ...overrides,
  };
}

describe('validateCheckout', () => {
  it('accepts a complete booking draft', () => {
    expect(validateCheckoutForBooking(makeDraft())).toEqual({ ok: true });
  });

  it('rejects missing or mismatched flight selection', () => {
    expect(validateBookingState(makeDraft({ selectedFlight: null, flightId: null }))).toEqual({
      ok: false,
      step: 'booking',
      message: 'A selected flight is required.',
    });

    expect(
      validateBookingState(
        makeDraft({
          flightId: 'FL-OTHER',
          selectedFlight: flight,
        }),
      ),
    ).toMatchObject({
      ok: false,
      step: 'booking',
      message: expect.stringMatching(/does not match/i),
    });
  });

  it('rejects zero or negative booking totals and missing cabin', () => {
    expect(
      validateBookingState(
        makeDraft({
          priceBreakdown: { ...EMPTY_PRICE_BREAKDOWN, finalTotal: 0 },
        }),
      ),
    ).toMatchObject({
      ok: false,
      step: 'booking',
      message: expect.stringMatching(/greater than zero/i),
    });

    expect(validateBookingState(makeDraft({ cabinClass: null }))).toMatchObject({
      ok: false,
      step: 'booking',
      message: expect.stringMatching(/cabin class/i),
    });
  });

  it('validates passenger name, DOB, gender, and infant adult links', () => {
    expect(validateBookingPassengers([])).toMatchObject({
      ok: false,
      step: 'passengers',
      message: expect.stringMatching(/at least one passenger/i),
    });

    expect(validateBookingPassengers([{ ...adult, firstName: '', lastName: '' }])).toMatchObject({
      ok: false,
      step: 'passengers',
      message: expect.stringMatching(/name/i),
    });

    expect(validateBookingPassengers([{ ...adult, dateOfBirth: '' }])).toMatchObject({
      ok: false,
      step: 'passengers',
      message: expect.stringMatching(/date of birth/i),
    });

    expect(validateBookingPassengers([{ ...adult, gender: '' }])).toMatchObject({
      ok: false,
      step: 'passengers',
      message: expect.stringMatching(/gender/i),
    });

    expect(validateBookingPassengers([{ ...infant, associatedAdultId: '' }])).toMatchObject({
      ok: false,
      step: 'passengers',
      message: expect.stringMatching(/accompanying adult/i),
    });

    expect(
      validateBookingPassengers([adult, { ...infant, associatedAdultId: 'missing-adult' }]),
    ).toMatchObject({
      ok: false,
      step: 'passengers',
      message: expect.stringMatching(/unknown adult/i),
    });

    expect(validateBookingPassengers([adult, infant])).toEqual({ ok: true });
  });

  it('requires unique seats for every adult and child', () => {
    expect(validateBookingSeats([adult, infant], [])).toMatchObject({
      ok: false,
      step: 'seats',
    });

    expect(
      validateBookingSeats(
        [adult, { ...adult, id: 'adult-2', firstName: 'Alan', lastName: 'Turing' }],
        [
          { passengerId: 'adult-1', seatId: '10A', label: '10A', price: 0 },
          { passengerId: 'adult-2', seatId: '10A', label: '10A', price: 0 },
        ],
      ),
    ).toMatchObject({
      ok: false,
      step: 'seats',
      message: expect.stringMatching(/one passenger/i),
    });

    expect(validateBookingSeats([infant], [])).toEqual({ ok: true });
  });

  it('requires baggage selections and rejects invalid baggage rules', () => {
    expect(validateBookingBaggage(makeDraft({ baggage: [] }))).toMatchObject({
      ok: false,
      step: 'baggage',
      message: expect.stringMatching(/choose baggage/i),
    });

    expect(
      validateBookingBaggage(
        makeDraft({
          baggage: [
            {
              passengerId: 'adult-1',
              cabinKg: 7,
              checkedKg: 0,
              additionalKg: 20,
            },
          ],
        }),
      ),
    ).toMatchObject({
      ok: false,
      step: 'baggage',
      message: expect.stringMatching(/checked baggage/i),
    });
  });

  it('allows empty addons and rejects invalid addon selections', () => {
    expect(validateBookingAddons(makeDraft({ addons: [] }))).toEqual({ ok: true });

    expect(
      validateBookingAddons(
        makeDraft({
          addons: [{ passengerId: 'adult-1', addonId: 'UNKNOWN_ADDON' }],
        }),
      ),
    ).toMatchObject({ ok: false, step: 'addons' });
  });

  it('requires payment method before booking creation', () => {
    expect(validateBookingPayment(null)).toMatchObject({
      ok: false,
      step: 'payment',
    });
    expect(
      validateBookingPayment({
        method: null,
        billingName: '',
        billingEmail: '',
        cardBrand: '',
        cardLast4: '',
      }),
    ).toMatchObject({ ok: false, step: 'payment' });
  });

  it('stops checkout validation at the first failing step', () => {
    const result = validateCheckoutForBooking(
      makeDraft({
        payment: null,
        seats: [],
      }),
    );

    expect(result).toMatchObject({ ok: false, step: 'seats' });
  });
});
