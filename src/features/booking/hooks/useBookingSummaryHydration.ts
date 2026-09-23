import { useEffect } from 'react';
import type { FlightOffer, FlightSearchCriteria } from '@/features/flights';
import type { PassengerDraft } from '@/features/passengers';
import { getSeatById, type SeatAssignment, type SeatModel } from '@/features/seats';
import { useBookingStore } from '../store/bookingStore';
import type { BookingSeatSelection } from '../types/booking';

function toBookingSeats(
  seats: SeatModel[],
  assignments: SeatAssignment[],
): BookingSeatSelection[] {
  return assignments
    .map((assignment) => {
      const seat = getSeatById(seats, assignment.seatId);
      if (!seat) {
        return null;
      }
      return {
        passengerId: assignment.passengerId,
        seatId: seat.id,
        label: seat.label,
        price: seat.price,
      } satisfies BookingSeatSelection;
    })
    .filter((item): item is BookingSeatSelection => item !== null);
}

/**
 * Pulls passengers, seats, and selected flight into the booking store when
 * earlier steps saved to their own drafts but not yet into booking state.
 */
export function useBookingSummaryHydration(options: {
  flightId: string;
  flight: FlightOffer | null | undefined;
  searchCriteria: FlightSearchCriteria | null;
  passengers: PassengerDraft[];
  seatSeats: SeatModel[];
  seatAssignments: SeatAssignment[];
  seatFlightId: string | null;
}) {
  const {
    flightId,
    flight,
    searchCriteria,
    passengers,
    seatSeats,
    seatAssignments,
    seatFlightId,
  } = options;

  const setSearchCriteria = useBookingStore((state) => state.setSearchCriteria);
  const setSelectedFlight = useBookingStore((state) => state.setSelectedFlight);
  const setPassengers = useBookingStore((state) => state.setPassengers);
  const setSeats = useBookingStore((state) => state.setSeats);

  useEffect(() => {
    if (searchCriteria) {
      setSearchCriteria(searchCriteria);
    }
  }, [searchCriteria, setSearchCriteria]);

  useEffect(() => {
    if (flight && flight.id === flightId) {
      setSelectedFlight(flight);
    }
  }, [flight, flightId, setSelectedFlight]);

  useEffect(() => {
    if (passengers.length > 0) {
      setPassengers(passengers);
    }
  }, [passengers, setPassengers]);

  useEffect(() => {
    if (seatFlightId !== flightId || seatAssignments.length === 0) {
      return;
    }
    setSeats(toBookingSeats(seatSeats, seatAssignments));
  }, [flightId, seatAssignments, seatFlightId, seatSeats, setSeats]);
}
