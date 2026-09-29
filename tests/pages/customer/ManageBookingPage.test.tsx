import { act, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import type { Booking } from '@/features/booking';
import { useBookingsStore } from '@/features/booking';
import type { FlightOffer } from '@/features/flights';
import { ManageBookingPage } from '@/pages/customer/ManageBookingPage';
import { renderWithProviders } from '../../utils/test-utils';

function makeBooking(): Booking {
  const flight = {
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
      refundPolicy: 'Refundable',
      changePolicy: 'Changes allowed',
      fareConditions: [],
    },
    segments: [],
    price: { amount: 200, currency: 'USD' },
    availableSeats: 10,
    refundable: true,
    baggageIncluded: true,
  } as FlightOffer;

  return {
    id: 'bkg-m1',
    reference: 'AB-MANAGE1',
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
    seats: [],
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
      seatCost: 0,
      baggageCost: 0,
      mealCost: 0,
      addonCost: 0,
      subtotal: 200,
      discount: 0,
      taxes: 16,
      finalTotal: 216,
    },
    transactionId: 'TXN-M1',
  };
}

describe('ManageBookingPage', () => {
  beforeEach(async () => {
    act(() => {
      useBookingsStore.getState().clearBookings();
    });
    await act(async () => {
      await useBookingsStore.persist.rehydrate();
    });
  });

  it('shows manage options for an editable booking', () => {
    act(() => {
      useBookingsStore.getState().saveBooking(makeBooking());
    });

    renderWithProviders(
      <Routes>
        <Route path="/app/bookings/:bookingReference/manage" element={<ManageBookingPage />} />
      </Routes>,
      { initialEntries: ['/app/bookings/AB-MANAGE1/manage'] },
    );

    expect(screen.getByRole('heading', { name: 'Manage booking' })).toBeInTheDocument();
    expect(screen.getByText('Change seat')).toBeInTheDocument();
    expect(screen.getByText('Add baggage')).toBeInTheDocument();
    expect(screen.getByText('Add meals')).toBeInTheDocument();
    expect(screen.getByText('Add add-ons')).toBeInTheDocument();
    expect(screen.getByText('Update contact details')).toBeInTheDocument();
    expect(screen.getByText('Change flight')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Search new flight' })).toBeInTheDocument();
  });
});
