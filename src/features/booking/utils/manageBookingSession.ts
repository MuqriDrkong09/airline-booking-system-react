import { getAllowanceForCabin } from '@/features/baggage/utils/baggageRules';
import { calculateBaggageTotal } from '@/features/baggage/utils/baggageRules';
import { calculateMealTotal } from '@/features/meals/utils/mealRules';
import { calculateAddonTotal } from '@/features/addons/utils/addonRules';
import type { PassengerDraft } from '@/features/passengers';
import { useSeatSelectionStore } from '@/features/seats';
import type { SeatAssignment } from '@/features/seats/types/seat';
import type { Booking } from '../types/bookingRecord';
import { useBookingStore } from '../store/bookingStore';
import { useBookingsStore } from '../store/bookingsStore';
import { formatPassengerLabel } from './bookingDetailHelpers';
import { recomputeBookingPriceBreakdown } from './recomputeBookingPriceBreakdown';

function toDraftPassengers(booking: Booking): PassengerDraft[] {
  return booking.passengers.map((passenger) => ({
    id: passenger.id,
    type: passenger.type,
    title: passenger.title,
    firstName: passenger.firstName,
    lastName: passenger.lastName,
    dateOfBirth: passenger.dateOfBirth,
    gender: passenger.gender,
    nationality: passenger.nationality,
    passportNumber: passenger.passportNumber,
    passportExpiry: passenger.passportExpiry,
    email: passenger.email,
    phone: passenger.phone,
    associatedAdultId: passenger.associatedAdultId,
  }));
}

function toSeatPassengers(booking: Booking) {
  return booking.passengers.map((passenger) => ({
    id: passenger.id,
    type: passenger.type,
    firstName: passenger.firstName,
    lastName: passenger.lastName,
    displayName: formatPassengerLabel(passenger),
  }));
}

function toPanelPassengers(booking: Booking) {
  return booking.passengers.map((passenger) => ({
    id: passenger.id,
    type: passenger.type,
    displayName: formatPassengerLabel(passenger),
  }));
}

/** Seeds the checkout draft + seat map so manage panels can reuse checkout UI. */
export function seedManageSession(booking: Booking): void {
  const bookingStore = useBookingStore.getState();
  const allowance = getAllowanceForCabin(booking.cabinClass);
  const panelPassengers = toPanelPassengers(booking);

  bookingStore.setSelectedFlight(booking.flight, booking.cabinClass);
  bookingStore.setPassengers(toDraftPassengers(booking));
  bookingStore.setSeats(booking.seats);
  bookingStore.setBaggage({
    flightId: booking.flightId,
    cabinClass: booking.cabinClass,
    baggage: booking.baggage,
    baggageTotal: calculateBaggageTotal(booking.baggage, panelPassengers, allowance),
  });
  bookingStore.setMeals({
    flightId: booking.flightId,
    meals: booking.meals,
    mealTotal: calculateMealTotal(booking.meals),
  });
  bookingStore.setAddons({
    flightId: booking.flightId,
    addons: booking.addons,
    addonTotal: calculateAddonTotal(booking.addons),
  });
  bookingStore.setPromoCode(booking.promoCode);
  bookingStore.setBookingReference(booking.reference);

  const seatStore = useSeatSelectionStore.getState();
  seatStore.initSelection({
    flightId: booking.flightId,
    aircraftModel: booking.flight.aircraft.model || 'Airbus A320',
    passengers: toSeatPassengers(booking),
  });

  const assignments: SeatAssignment[] = booking.seats.map((seat) => ({
    passengerId: seat.passengerId,
    seatId: seat.seatId,
  }));
  seatStore.hydrateAssignments(assignments);
}

/** Writes current checkout draft ancillaries back onto the saved booking. */
export function commitManageSession(reference: string): Booking | undefined {
  const draft = useBookingStore.getState();
  return useBookingsStore.getState().updateBooking(reference, (booking) => {
    const next: Booking = {
      ...booking,
      seats: draft.seats.map((seat) => ({ ...seat })),
      baggage: draft.baggage.map((item) => ({ ...item })),
      meals: draft.meals.map((item) => ({ ...item })),
      addons: draft.addons.map((item) => ({ ...item })),
      updatedAt: new Date().toISOString(),
    };
    return {
      ...next,
      priceBreakdown: recomputeBookingPriceBreakdown(next),
    };
  });
}

export function clearManageSession(): void {
  useBookingStore.getState().clearBooking();
  useSeatSelectionStore.getState().clearSelection();
}

export { toPanelPassengers, toSeatPassengers };
