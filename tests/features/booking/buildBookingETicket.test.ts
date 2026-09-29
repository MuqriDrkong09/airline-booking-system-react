import {
  buildBookingETickets,
  buildETicketQrPayload,
  parseETicketQrPayload,
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
  reference: 'AB-TEST1234',
  status: 'CONFIRMED',
  createdAt: '2026-09-24T03:00:00.000Z',
  updatedAt: '2026-09-24T03:00:00.000Z',
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
  ],
  seats: [{ passengerId: 'p1', seatId: '12A', label: '12A', price: 20 }],
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
};

describe('buildBookingETicket', () => {
  it('builds required e-ticket fields for each passenger', () => {
    const [ticket] = buildBookingETickets(booking);

    expect(ticket?.passengerName).toContain('Alex Traveler');
    expect(ticket?.bookingReference).toBe('AB-TEST1234');
    expect(ticket?.airline).toBe('AirAsia');
    expect(ticket?.flightNumber).toBe('AK130');
    expect(ticket?.originCode).toBe('KUL');
    expect(ticket?.destinationCode).toBe('PEN');
    expect(ticket?.departureDate).toBe('2026-10-20');
    expect(ticket?.departureTime).toBe('09:00');
    expect(ticket?.arrivalTime).toBe('10:05');
    expect(ticket?.seat).toBe('12A');
    expect(ticket?.boarding.terminal).toBe('2');
    expect(ticket?.boarding.gate).toMatch(/TBA/i);
    expect(ticket?.boarding.boardingTime).toBe('2026-10-20T08:15');
  });

  it('encodes only a safe booking identifier in the QR payload', () => {
    const payload = buildETicketQrPayload(booking.reference);
    const [ticket] = buildBookingETickets(booking);

    expect(payload).toBe('AEROBOOK:AB-TEST1234');
    expect(ticket?.qrPayload).toBe(payload);
    expect(payload).not.toMatch(/Alex|Traveler|passport|email|phone|12A/i);
    expect(parseETicketQrPayload(payload)).toBe('AB-TEST1234');
  });
});
