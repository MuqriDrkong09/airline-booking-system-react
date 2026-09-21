import type { PassengerType } from '../constants/passenger';
import type { PassengerCounts, PassengerDraft } from '../types/passenger';

function createId(type: PassengerType, index: number): string {
  return `${type.toLowerCase()}-${index + 1}`;
}

export function createEmptyPassenger(type: PassengerType, index: number): PassengerDraft {
  return {
    id: createId(type, index),
    type,
    title: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    email: '',
    phone: '',
    associatedAdultId: '',
  };
}

/** Build ordered adult → child → infant slots matching search criteria counts. */
export function createPassengerSlots(counts: PassengerCounts): PassengerDraft[] {
  const adults = Array.from({ length: Math.max(0, counts.adults) }, (_, index) =>
    createEmptyPassenger('ADULT', index),
  );
  const children = Array.from({ length: Math.max(0, counts.children) }, (_, index) =>
    createEmptyPassenger('CHILD', index),
  );
  const infants = Array.from({ length: Math.max(0, counts.infants) }, (_, index) =>
    createEmptyPassenger('INFANT', index),
  );

  return [...adults, ...children, ...infants];
}

export function countPassengersByType(passengers: readonly PassengerDraft[]): PassengerCounts {
  return passengers.reduce<PassengerCounts>(
    (counts, passenger) => {
      if (passenger.type === 'ADULT') {
        counts.adults += 1;
      } else if (passenger.type === 'CHILD') {
        counts.children += 1;
      } else {
        counts.infants += 1;
      }
      return counts;
    },
    { adults: 0, children: 0, infants: 0 },
  );
}

export function passengerCountsMatch(
  actual: PassengerCounts,
  expected: PassengerCounts,
): boolean {
  return (
    actual.adults === expected.adults &&
    actual.children === expected.children &&
    actual.infants === expected.infants
  );
}
