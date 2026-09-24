import {
  buildCalendarIcs,
  buildETicketText,
  buildInvoiceText,
  type Booking,
} from '@/features/booking';
import type { FlightOffer } from '@/features/flights';

const flight = {
  id: 'FL-100',
  airline: { code: 'AK', name: 'AirAsia' },
  flightNumber: 'AK130',
  aircraft: { model: 'A320' },
  origin: { code: 'KUL', city: 'Kuala Lumpur', airportName: 'KLIA' },
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
      passportNumber: '',
      passportExpiry: '',
      email: 'alex@example.com',
      phone: '',
      associatedAdultId: '',
    },
  ],
  seats: [{ passengerId: 'p1', seatId: '12A', label: '12A', price: 20 }],
  baggage: [{ passengerId: 'p1', cabinKg: 7, checkedKg: 20, additionalKg: 0 }],
  meals: [{ passengerId: 'p1', mealType: null, quantity: 0 }],
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
    taxes: 81.6,
    finalTotal: 1101.6,
  },
  transactionId: 'TXN-1',
};

describe('bookingDocuments', () => {
  it('builds an e-ticket with reference and seat', () => {
    const text = buildETicketText(booking);
    expect(text).toContain('AB-TEST1234');
    expect(text).toContain('12A');
    expect(text).toContain('AK130');
  });

  it('builds an invoice with payment totals', () => {
    const text = buildInvoiceText(booking);
    expect(text).toContain('Invoice for booking AB-TEST1234');
    expect(text).toContain('FPX');
    expect(text).toContain('Total:');
  });

  it('builds a calendar ICS event for the flight', () => {
    const ics = buildCalendarIcs(booking);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('AB-TEST1234');
    expect(ics).toContain('DTSTART:20261020T090000');
  });
});
