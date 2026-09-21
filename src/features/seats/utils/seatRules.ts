import type { SeatStatus } from '../constants/seat';
import type { Seat, SeatAssignment, SeatPassenger } from '../types/seat';

const SELECTABLE_STATUSES = new Set(['AVAILABLE', 'PREMIUM', 'EMERGENCY_EXIT']);

export function isSeatSelectable(seat: Seat): boolean {
  return SELECTABLE_STATUSES.has(seat.status);
}

export function canPassengerSelectSeats(passenger: SeatPassenger): boolean {
  return passenger.type !== 'INFANT';
}

export function getAssignmentForPassenger(
  assignments: SeatAssignment[],
  passengerId: string,
): SeatAssignment | undefined {
  return assignments.find((assignment) => assignment.passengerId === passengerId);
}

export function getAssignmentForSeat(
  assignments: SeatAssignment[],
  seatId: string,
): SeatAssignment | undefined {
  return assignments.find((assignment) => assignment.seatId === seatId);
}

export function getSeatById(seats: Seat[], seatId: string): Seat | undefined {
  return seats.find((seat) => seat.id === seatId);
}

export function resolveDisplayStatus(
  seat: Seat,
  assignments: SeatAssignment[],
  _selectedPassengerId: string | null,
): SeatStatus {
  if (getAssignmentForSeat(assignments, seat.id)) {
    return 'SELECTED';
  }
  return seat.status;
}

export type SeatSelectionResult =
  | { ok: true; assignments: SeatAssignment[] }
  | { ok: false; reason: string };

/**
 * Assigns `seatId` to `passengerId`, clearing any previous seat for that passenger
 * and any other passenger who held that seat. Rejects occupied/unavailable seats
 * and infant passengers.
 */
export function applySeatSelection(options: {
  seats: Seat[];
  assignments: SeatAssignment[];
  passengerId: string;
  seatId: string;
  passengers: SeatPassenger[];
}): SeatSelectionResult {
  const { seats, assignments, passengerId, seatId, passengers } = options;
  const passenger = passengers.find((item) => item.id === passengerId);

  if (!passenger) {
    return { ok: false, reason: 'Select a passenger before choosing a seat.' };
  }

  if (!canPassengerSelectSeats(passenger)) {
    return { ok: false, reason: 'Infants do not get their own seat.' };
  }

  const seat = getSeatById(seats, seatId);
  if (!seat) {
    return { ok: false, reason: 'Seat not found.' };
  }

  const existingForPassenger = getAssignmentForPassenger(assignments, passengerId);
  if (existingForPassenger?.seatId === seatId) {
    return {
      ok: true,
      assignments: assignments.filter((assignment) => assignment.passengerId !== passengerId),
    };
  }

  if (!isSeatSelectable(seat)) {
    if (seat.status === 'OCCUPIED') {
      return { ok: false, reason: 'That seat is already occupied.' };
    }
    return { ok: false, reason: 'That seat is unavailable.' };
  }

  const next = assignments.filter(
    (assignment) => assignment.passengerId !== passengerId && assignment.seatId !== seatId,
  );
  next.push({ passengerId, seatId });
  return { ok: true, assignments: next };
}

export function calculateSeatPriceTotal(
  seats: Seat[],
  assignments: SeatAssignment[],
): number {
  return assignments.reduce((total, assignment) => {
    const seat = getSeatById(seats, assignment.seatId);
    return total + (seat?.price ?? 0);
  }, 0);
}

export function countAssignedPassengers(assignments: SeatAssignment[]): number {
  return assignments.length;
}

export function passengersNeedingSeats(passengers: SeatPassenger[]): SeatPassenger[] {
  return passengers.filter(canPassengerSelectSeats);
}
