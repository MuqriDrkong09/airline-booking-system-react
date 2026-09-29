import {
  ClientInvoiceProvider,
  getInvoiceProvider,
  resetInvoiceProvider,
  setInvoiceProvider,
  type Booking,
  type InvoiceProvider,
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
  seats: [],
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
    seatCost: 0,
    baggageCost: 0,
    mealCost: 0,
    addonCost: 0,
    subtotal: 1000,
    discount: 0,
    taxes: 80,
    finalTotal: 1080,
  },
  transactionId: 'TXN-1',
};

describe('ClientInvoiceProvider', () => {
  afterEach(() => {
    resetInvoiceProvider();
  });

  it('creates a structured invoice and text artifact', async () => {
    const provider = new ClientInvoiceProvider();
    const invoice = provider.createInvoice(booking);
    const artifact = await provider.getArtifact(booking);

    expect(invoice.invoiceNumber).toMatch(/^INV-/);
    expect(artifact.mimeType).toBe('text/plain');
    expect(artifact.filename).toContain('AB-TEST1234');
    expect(artifact.invoice.invoiceNumber).toBe(invoice.invoiceNumber);
    expect(artifact.blob).toBeInstanceOf(Blob);
    expect(artifact.blob.size).toBeGreaterThan(0);
  });

  it('navigates for view and print delivery modes', async () => {
    const navigate = jest.fn();
    const provider = new ClientInvoiceProvider();

    await provider.deliver(booking, { mode: 'view', navigate });
    expect(navigate).toHaveBeenCalledWith('/app/bookings/AB-TEST1234/invoice');

    await provider.deliver(booking, { mode: 'print', navigate });
    expect(navigate).toHaveBeenCalledWith(
      '/app/bookings/AB-TEST1234/invoice?print=1',
    );
  });

  it('allows swapping the active provider for a future PDF implementation', async () => {
    const base = new ClientInvoiceProvider();
    const stub: InvoiceProvider = {
      createInvoice: (item) => base.createInvoice(item),
      getArtifact: async (item) => ({
        invoice: base.createInvoice(item),
        mimeType: 'application/pdf',
        filename: 'invoice.pdf',
        blob: new Blob(['%PDF'], { type: 'application/pdf' }),
      }),
      deliver: async () => undefined,
    };

    setInvoiceProvider(stub);
    const artifact = await getInvoiceProvider().getArtifact(booking);
    expect(artifact.mimeType).toBe('application/pdf');
  });
});
