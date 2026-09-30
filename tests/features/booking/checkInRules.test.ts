import type { Booking } from '@/features/booking';
import {
  CHECK_IN_BLOCKED_MESSAGES,
  findBookingForCheckIn,
  getCheckInBlockedReason,
  getEligibleCheckInPassengers,
  isCheckInWindowOpen,
  isFlightDeparted,
  isPassengerCheckedIn,
} from '@/features/booking';
import type { FlightOffer } from '@/features/flights';

function localDepartureInHours(hoursFromNow: number): string {
  const date = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function makeBooking(
  overrides: Partial<Booking> & { departureHoursFromNow?: number } = {},
): Booking {
  const { departureHoursFromNow = 24, flight: flightOverride, ...rest } = overrides;
  const flight = {
    id: 'FL-100',
    airline: { code: 'AK', name: 'AirAsia' },
    flightNumber: 'AK130',
    aircraft: { model: 'A320' },
    origin: { code: 'KUL', city: 'Kuala Lumpur', airportName: 'KLIA' },
    destination: { code: 'PEN', city: 'George Town', airportName: 'Penang' },
    departureTime: localDepartureInHours(departureHoursFromNow),
    arrivalTime: localDepartureInHours(departureHoursFromNow + 1),
    durationMinutes: 65,
    stops: 0,
    stopAirports: [],
    cabinClass: 'ECONOMY',
    baggage: { cabinKg: 7, checkedKg: 20, pieces: 1 },
    amenities: { meals: '', wifi: false, wifiNotes: '', seatInformation: '' },
    policies: { refundPolicy: '', changePolicy: '', fareConditions: [] },
    segments: [],
    price: { amount: 100, currency: 'MYR' },
    availableSeats: 10,
    refundable: true,
    baggageIncluded: true,
    ...flightOverride,
  } as FlightOffer;

  return {
    id: 'bkg-1',
    reference: 'AB-CHECKIN1',
    status: 'CONFIRMED',
    createdAt: '2026-09-24T03:00:00.000Z',
    updatedAt: '2026-09-24T03:00:00.000Z',
    flightId: 'FL-100',
    cabinClass: 'ECONOMY',
    searchCriteria: null,
    passengers: [
      {
        id: 'p1',
        type: 'ADULT',
        title: 'Mr',
        firstName: 'Alex',
        lastName: 'Traveler',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        nationality: 'MY',
        passportNumber: '',
        passportExpiry: '',
        email: 'alex@example.com',
        phone: '',
        associatedAdultId: '',
      },
      {
        id: 'p2',
        type: 'ADULT',
        title: 'Ms',
        firstName: 'Sam',
        lastName: 'Traveler',
        dateOfBirth: '1992-01-01',
        gender: 'FEMALE',
        nationality: 'MY',
        passportNumber: '',
        passportExpiry: '',
        email: 'sam@example.com',
        phone: '',
        associatedAdultId: '',
      },
    ],
    seats: [
      { passengerId: 'p1', seatId: '12A', label: '12A', price: 0 },
      { passengerId: 'p2', seatId: '12B', label: '12B', price: 0 },
    ],
    baggage: [
      { passengerId: 'p1', cabinKg: 7, checkedKg: 20, additionalKg: 0 },
      { passengerId: 'p2', cabinKg: 7, checkedKg: 0, additionalKg: 0 },
    ],
    meals: [],
    addons: [],
    promoCode: null,
    payment: {
      method: 'FPX',
      billingName: 'Alex Traveler',
      billingEmail: 'alex@example.com',
      cardBrand: '',
      cardLast4: '',
    },
    priceBreakdown: {
      currency: 'MYR',
      baseFare: 200,
      seatCost: 0,
      baggageCost: 0,
      mealCost: 0,
      addonCost: 0,
      subtotal: 200,
      discount: 0,
      taxes: 16,
      finalTotal: 216,
    },
    transactionId: 'TXN-1',
    checkedInPassengerIds: [],
    ...rest,
    flight,
  };
}

describe('checkInRules', () => {
  it('opens the check-in window within 48 hours of departure', () => {
    expect(isCheckInWindowOpen(makeBooking({ departureHoursFromNow: 24 }))).toBe(true);
    expect(isCheckInWindowOpen(makeBooking({ departureHoursFromNow: 72 }))).toBe(false);
  });

  it('detects departed flights and closed windows', () => {
    expect(isFlightDeparted(makeBooking({ departureHoursFromNow: -1 }))).toBe(true);
    expect(getCheckInBlockedReason(makeBooking({ departureHoursFromNow: -1 }))).toBe(
      'DEPARTED',
    );
    expect(getCheckInBlockedReason(makeBooking({ departureHoursFromNow: 0.5 }))).toBe(
      'WINDOW_CLOSED',
    );
  });

  it('blocks cancelled bookings and already checked-in passengers', () => {
    expect(
      getCheckInBlockedReason(makeBooking({ status: 'CANCELLED', departureHoursFromNow: 24 })),
    ).toBe('CANCELLED');
    expect(
      getCheckInBlockedReason(
        makeBooking({
          departureHoursFromNow: 24,
          checkedInPassengerIds: ['p1', 'p2'],
        }),
      ),
    ).toBe('ALREADY_CHECKED_IN');
  });

  it('looks up bookings by reference and last name', () => {
    const booking = makeBooking();
    const ok = findBookingForCheckIn([booking], 'ab-checkin1', 'traveler');
    expect(ok.booking?.reference).toBe('AB-CHECKIN1');
    expect(ok.reason).toBeNull();

    const badName = findBookingForCheckIn([booking], 'AB-CHECKIN1', 'Nobody');
    expect(badName.reason).toBe('LAST_NAME_MISMATCH');
    expect(CHECK_IN_BLOCKED_MESSAGES.LAST_NAME_MISMATCH).toMatch(/last name/i);
  });

  it('lists only passengers who are not yet checked in', () => {
    const booking = makeBooking({ checkedInPassengerIds: ['p1'] });
    const eligible = getEligibleCheckInPassengers(booking);
    expect(eligible.map((item) => item.id)).toEqual(['p2']);
    expect(isPassengerCheckedIn(booking, 'p1')).toBe(true);
  });
});
