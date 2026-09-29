import {
  buildBookingInvoice,
  deriveInvoicePaymentStatus,
  formatInvoiceAsText,
  generateInvoiceNumber,
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

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
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
      baggageCost: 50,
      mealCost: 30,
      addonCost: 40,
      subtotal: 1140,
      discount: 100,
      taxes: 83.2,
      finalTotal: 1123.2,
    },
    transactionId: 'TXN-1',
    ...overrides,
  };
}

describe('buildBookingInvoice', () => {
  it('includes all required invoice fields', () => {
    const booking = makeBooking();
    const invoice = buildBookingInvoice(booking);

    expect(invoice.invoiceNumber).toBe('INV-ABTEST1234');
    expect(invoice.bookingReference).toBe('AB-TEST1234');
    expect(invoice.passengers[0]?.name).toContain('Alex Traveler');
    expect(invoice.flight.flightNumber).toBe('AK130');
    expect(invoice.fare).toBe(1000);
    expect(invoice.baggage).toBe(50);
    expect(invoice.meals).toBe(30);
    expect(invoice.addons).toBe(40);
    expect(invoice.taxes).toBe(83.2);
    expect(invoice.discount).toBe(100);
    expect(invoice.total).toBe(1123.2);
    expect(invoice.paymentStatus).toBe('PAID');
    expect(invoice.paymentDate).toBe(booking.createdAt);
  });

  it('derives payment status from booking lifecycle', () => {
    expect(deriveInvoicePaymentStatus(makeBooking({ status: 'PENDING' }))).toBe(
      'PENDING',
    );
    expect(deriveInvoicePaymentStatus(makeBooking({ status: 'REFUNDED' }))).toBe(
      'REFUNDED',
    );
    expect(
      deriveInvoicePaymentStatus(
        makeBooking({
          status: 'CANCELLED',
          cancellation: {
            requestedAt: '2026-09-25T00:00:00.000Z',
            processedAt: '2026-09-25T00:00:00.000Z',
            fee: 50,
            refundAmount: 900,
            currency: 'MYR',
            policySummary: 'Refundable',
            finalStatus: 'CANCELLED',
          },
        }),
      ),
    ).toBe('REFUNDED');
  });

  it('formats a text artifact with invoice number and totals', () => {
    const invoice = buildBookingInvoice(makeBooking());
    const text = formatInvoiceAsText(invoice);

    expect(text).toContain(`Invoice number: ${generateInvoiceNumber(makeBooking())}`);
    expect(text).toContain('Booking reference: AB-TEST1234');
    expect(text).toContain('Payment status: Paid');
    expect(text).toContain('Total:');
  });
});
