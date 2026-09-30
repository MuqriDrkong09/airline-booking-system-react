import {
  assignBoardingGate,
  assignBoardingGroup,
  buildBoardingPasses,
  buildBoardingPassScanPayload,
  canViewBoardingPass,
  parseBoardingPassScanPayload,
  type Booking,
} from '@/features/booking';
import type { FlightOffer } from '@/features/flights';

const flight = {
  id: 'FL-100',
  airline: { code: 'AK', name: 'AirAsia' },
  flightNumber: 'AK130',
  aircraft: { model: 'A320' },
  origin: { code: 'KUL', city: 'Kuala Lumpur', airportName: 'KLIA', terminal: '2' },
  destination: { code: 'PEN', city: 'George Town', airportName: 'Penang' },
  departureTime: '2026-10-20T09:00',
  arrivalTime: '2026-10-20T10:05',
  durationMinutes: 65,
  stops: 0,
  stopAirports: [],
  cabinClass: 'ECONOMY',
  baggage: { cabinKg: 7, checkedKg: 20, pieces: 1 },
  amenities: { meals: '', wifi: false, wifiNotes: '', seatInformation: '' },
  policies: { refundPolicy: '', changePolicy: '', fareConditions: [] },
  segments: [],
  price: { amount: 1000, currency: 'MYR' },
  availableSeats: 10,
  refundable: true,
  baggageIncluded: true,
} as FlightOffer;

const booking: Booking = {
  id: 'bkg-1',
  reference: 'AB-BP1234',
  status: 'CHECKED_IN',
  createdAt: '2026-09-24T03:00:00.000Z',
  updatedAt: '2026-09-24T04:00:00.000Z',
  flightId: 'FL-100',
  cabinClass: 'ECONOMY',
  flight,
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
      passportNumber: 'A1234567',
      passportExpiry: '2030-01-01',
      email: 'alex@example.com',
      phone: '+60123456789',
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
      passportNumber: 'B7654321',
      passportExpiry: '2031-01-01',
      email: 'sam@example.com',
      phone: '',
      associatedAdultId: '',
    },
  ],
  seats: [
    { passengerId: 'p1', seatId: '12A', label: '12A', price: 20 },
    { passengerId: 'p2', seatId: '22B', label: '22B', price: 0 },
  ],
  baggage: [],
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
    baseFare: 1000,
    seatCost: 20,
    baggageCost: 0,
    mealCost: 0,
    addonCost: 0,
    subtotal: 1020,
    discount: 0,
    taxes: 80,
    finalTotal: 1100,
  },
  transactionId: 'TXN-1',
  checkedInPassengerIds: ['p1', 'p2'],
};

describe('buildBoardingPass', () => {
  it('builds required boarding pass fields for checked-in passengers', () => {
    const passes = buildBoardingPasses(booking);
    expect(passes).toHaveLength(2);

    const [first] = passes;
    expect(first?.passengerName).toContain('Alex Traveler');
    expect(first?.flightNumber).toBe('AK130');
    expect(first?.originCode).toBe('KUL');
    expect(first?.destinationCode).toBe('PEN');
    expect(first?.date).toBe('2026-10-20');
    expect(first?.departureTime).toBe('09:00');
    expect(first?.boardingTime).toBe('08:15');
    expect(first?.terminal).toBe('2');
    expect(first?.gate).toBe(assignBoardingGate('AK130'));
    expect(first?.seat).toBe('12A');
    expect(first?.boardingGroup).toBe(assignBoardingGroup('ECONOMY', '12A'));
  });

  it('encodes only a safe scan identifier in QR/barcode payload', () => {
    const payload = buildBoardingPassScanPayload(booking.reference, 1);
    const [pass] = buildBoardingPasses(booking);

    expect(payload).toBe('AEROBOOK-BP:AB-BP1234:01');
    expect(pass?.scanPayload).toBe(payload);
    expect(payload).not.toMatch(/Alex|Traveler|passport|email|phone|12A/i);
    expect(parseBoardingPassScanPayload(payload)).toEqual({
      reference: 'AB-BP1234',
      sequence: '01',
    });
  });

  it('is available after check-in and assigns boarding groups by seat row', () => {
    expect(canViewBoardingPass(booking)).toBe(true);
    expect(canViewBoardingPass({ ...booking, status: 'CONFIRMED', checkedInPassengerIds: [] })).toBe(
      false,
    );
    expect(assignBoardingGroup('BUSINESS', '2A')).toBe('1');
    expect(assignBoardingGroup('ECONOMY', '8A')).toBe('2');
    expect(assignBoardingGroup('ECONOMY', '22B')).toBe('4');
  });
});
