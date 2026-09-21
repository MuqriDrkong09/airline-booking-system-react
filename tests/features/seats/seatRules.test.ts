import {
  applySeatSelection,
  calculateSeatPriceTotal,
  canPassengerSelectSeats,
  isSeatSelectable,
  passengersNeedingSeats,
  resolveDisplayStatus,
} from '@/features/seats';
import type { SeatModel, SeatAssignment, SeatPassenger } from '@/features/seats';

const adult: SeatPassenger = {
  id: 'adult-1',
  type: 'ADULT',
  firstName: 'Ada',
  lastName: 'Lovelace',
  displayName: 'Ada Lovelace',
};

const child: SeatPassenger = {
  id: 'child-1',
  type: 'CHILD',
  firstName: 'Alan',
  lastName: 'Turing',
  displayName: 'Alan Turing',
};

const infant: SeatPassenger = {
  id: 'infant-1',
  type: 'INFANT',
  firstName: 'Grace',
  lastName: 'Hopper',
  displayName: 'Grace Hopper',
};

const seats: SeatModel[] = [
  {
    id: 'economy-10A',
    row: 10,
    column: 'A',
    label: '10A',
    class: 'ECONOMY',
    price: 35,
    status: 'AVAILABLE',
    features: ['WINDOW'],
  },
  {
    id: 'economy-10B',
    row: 10,
    column: 'B',
    label: '10B',
    class: 'ECONOMY',
    price: 0,
    status: 'OCCUPIED',
    features: [],
  },
  {
    id: 'economy-10C',
    row: 10,
    column: 'C',
    label: '10C',
    class: 'ECONOMY',
    price: 25,
    status: 'EMERGENCY_EXIT',
    features: ['AISLE', 'EXTRA_LEGROOM'],
  },
  {
    id: 'economy-10D',
    row: 10,
    column: 'D',
    label: '10D',
    class: 'ECONOMY',
    price: 45,
    status: 'PREMIUM',
    features: ['AISLE'],
  },
  {
    id: 'economy-10E',
    row: 10,
    column: 'E',
    label: '10E',
    class: 'ECONOMY',
    price: 0,
    status: 'UNAVAILABLE',
    features: [],
  },
];

describe('seat selection rules', () => {
  it('allows available, premium, and emergency exit seats', () => {
    expect(isSeatSelectable(seats[0]!)).toBe(true);
    expect(isSeatSelectable(seats[2]!)).toBe(true);
    expect(isSeatSelectable(seats[3]!)).toBe(true);
  });

  it('blocks occupied and unavailable seats', () => {
    expect(isSeatSelectable(seats[1]!)).toBe(false);
    expect(isSeatSelectable(seats[4]!)).toBe(false);
  });

  it('does not assign seats to infants', () => {
    expect(canPassengerSelectSeats(infant)).toBe(false);
    expect(passengersNeedingSeats([adult, child, infant])).toEqual([adult, child]);

    const result = applySeatSelection({
      seats,
      assignments: [],
      passengerId: infant.id,
      seatId: 'economy-10A',
      passengers: [adult, child, infant],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/infants/i);
    }
  });

  it('prevents selecting occupied seats', () => {
    const result = applySeatSelection({
      seats,
      assignments: [],
      passengerId: adult.id,
      seatId: 'economy-10B',
      passengers: [adult],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/occupied/i);
    }
  });

  it('prevents selecting unavailable seats', () => {
    const result = applySeatSelection({
      seats,
      assignments: [],
      passengerId: adult.id,
      seatId: 'economy-10E',
      passengers: [adult],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/unavailable/i);
    }
  });

  it('assigns one seat per passenger and replaces prior assignment', () => {
    const first = applySeatSelection({
      seats,
      assignments: [],
      passengerId: adult.id,
      seatId: 'economy-10A',
      passengers: [adult, child],
    });
    expect(first.ok).toBe(true);
    if (!first.ok) {
      return;
    }

    const second = applySeatSelection({
      seats,
      assignments: first.assignments,
      passengerId: adult.id,
      seatId: 'economy-10D',
      passengers: [adult, child],
    });

    expect(second.ok).toBe(true);
    if (!second.ok) {
      return;
    }
    expect(second.assignments).toEqual([{ passengerId: adult.id, seatId: 'economy-10D' }]);
  });

  it('toggles off when the same seat is clicked again', () => {
    const assigned = applySeatSelection({
      seats,
      assignments: [],
      passengerId: adult.id,
      seatId: 'economy-10A',
      passengers: [adult],
    });
    expect(assigned.ok).toBe(true);
    if (!assigned.ok) {
      return;
    }

    const toggled = applySeatSelection({
      seats,
      assignments: assigned.assignments,
      passengerId: adult.id,
      seatId: 'economy-10A',
      passengers: [adult],
    });

    expect(toggled.ok).toBe(true);
    if (!toggled.ok) {
      return;
    }
    expect(toggled.assignments).toEqual([]);
  });

  it('reassigns a seat from another passenger', () => {
    const initial: SeatAssignment[] = [{ passengerId: child.id, seatId: 'economy-10A' }];
    const result = applySeatSelection({
      seats,
      assignments: initial,
      passengerId: adult.id,
      seatId: 'economy-10A',
      passengers: [adult, child],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.assignments).toEqual([{ passengerId: adult.id, seatId: 'economy-10A' }]);
  });

  it('calculates total seat fees from assignments', () => {
    const assignments: SeatAssignment[] = [
      { passengerId: adult.id, seatId: 'economy-10A' },
      { passengerId: child.id, seatId: 'economy-10D' },
    ];
    expect(calculateSeatPriceTotal(seats, assignments)).toBe(80);
  });

  it('resolves selected display status from assignments', () => {
    const assignments: SeatAssignment[] = [{ passengerId: adult.id, seatId: 'economy-10A' }];
    expect(resolveDisplayStatus(seats[0]!, assignments, adult.id)).toBe('SELECTED');
    expect(resolveDisplayStatus(seats[2]!, assignments, adult.id)).toBe('EMERGENCY_EXIT');
  });
});
