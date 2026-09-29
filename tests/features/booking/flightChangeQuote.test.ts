import type { Booking } from '@/features/booking';
import {
  buildBookingAfterFlightChange,
  calculateFlightChangeQuote,
  FLIGHT_CHANGE_FEE_PER_PASSENGER,
} from '@/features/booking';
import type { FlightOffer } from '@/features/flights';

function makeFlight(overrides?: Partial<FlightOffer>): FlightOffer {
  return {
    id: 'FL-100',
    airline: { code: 'AB', name: 'AeroBook Air' },
    flightNumber: 'AB100',
    aircraft: { model: 'A320' },
    origin: { code: 'KUL', city: 'Kuala Lumpur', airportName: 'KLIA' },
    destination: { code: 'NRT', city: 'Tokyo', airportName: 'Narita' },
    departureTime: '2099-10-20T09:00',
    arrivalTime: '2099-10-20T17:00',
    durationMinutes: 420,
    stops: 0,
    stopAirports: [],
    cabinClass: 'ECONOMY',
    baggage: { cabinKg: 7, checkedKg: 20, pieces: 1 },
    amenities: { meals: '', wifi: false, wifiNotes: '', seatInformation: '' },
    policies: {
      refundPolicy: 'Refundable with fee',
      changePolicy: 'Changes allowed with fee plus fare difference',
      fareConditions: [],
    },
    segments: [],
    price: { amount: 200, currency: 'USD' },
    availableSeats: 10,
    refundable: true,
    baggageIncluded: true,
    ...overrides,
  } as FlightOffer;
}

function makeBooking(): Booking {
  const flight = makeFlight();
  return {
    id: 'bkg-1',
    reference: 'AB-CHG1',
    status: 'CONFIRMED',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    flightId: flight.id,
    cabinClass: 'ECONOMY',
    flight,
    searchCriteria: null,
    passengers: [
      {
        id: 'p1',
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
      },
    ],
    seats: [{ passengerId: 'p1', seatId: '12A', label: '12A', price: 25 }],
    baggage: [],
    meals: [],
    addons: [],
    promoCode: null,
    payment: {
      method: 'CREDIT_CARD',
      billingName: 'Ada',
      billingEmail: 'ada@example.com',
      cardBrand: 'visa',
      cardLast4: '1111',
    },
    priceBreakdown: {
      currency: 'USD',
      baseFare: 200,
      seatCost: 25,
      baggageCost: 0,
      mealCost: 0,
      addonCost: 0,
      subtotal: 225,
      discount: 0,
      taxes: 18,
      finalTotal: 243,
    },
    transactionId: 'TXN-1',
  };
}

describe('flightChangeQuote', () => {
  it('calculates original fare, new fare, change fee, and net due', () => {
    const booking = makeBooking();
    const newFlight = makeFlight({
      id: 'FL-200',
      flightNumber: 'AB200',
      price: { amount: 260, currency: 'USD' },
    });

    const quote = calculateFlightChangeQuote(booking, newFlight);

    expect(quote.originalFare).toBe(200);
    expect(quote.newFare).toBe(260);
    expect(quote.changeFee).toBe(FLIGHT_CHANGE_FEE_PER_PASSENGER);
    expect(quote.fareDifference).toBe(60);
    expect(quote.netAmountDue).toBe(60 + FLIGHT_CHANGE_FEE_PER_PASSENGER);
  });

  it('applies flight change, clears seats, and recomputes totals', () => {
    const booking = makeBooking();
    const newFlight = makeFlight({
      id: 'FL-300',
      flightNumber: 'AB300',
      price: { amount: 180, currency: 'USD' },
    });

    const next = buildBookingAfterFlightChange(booking, newFlight);

    expect(next.flightId).toBe('FL-300');
    expect(next.flight.flightNumber).toBe('AB300');
    expect(next.seats).toEqual([]);
    expect(next.priceBreakdown.baseFare).toBe(180);
    expect(next.priceBreakdown.seatCost).toBe(0);
  });
});
