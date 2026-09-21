import { act } from '@testing-library/react';
import { useSeatSelectionStore } from '@/features/seats';
import type { SeatPassenger } from '@/features/seats';

const passengers: SeatPassenger[] = [
  {
    id: 'adult-1',
    type: 'ADULT',
    firstName: 'Ada',
    lastName: 'Lovelace',
    displayName: 'Ada Lovelace',
  },
  {
    id: 'child-1',
    type: 'CHILD',
    firstName: 'Alan',
    lastName: 'Turing',
    displayName: 'Alan Turing',
  },
  {
    id: 'infant-1',
    type: 'INFANT',
    firstName: 'Grace',
    lastName: 'Hopper',
    displayName: 'Grace Hopper',
  },
];

describe('seatSelectionStore', () => {
  beforeEach(() => {
    act(() => {
      useSeatSelectionStore.getState().clearSelection();
      void useSeatSelectionStore.persist.clearStorage();
    });
  });

  it('initializes a seat map and selects the first eligible passenger', () => {
    act(() => {
      useSeatSelectionStore.getState().initSelection({
        flightId: 'FL-100',
        passengers,
      });
    });

    const state = useSeatSelectionStore.getState();
    expect(state.seats.length).toBeGreaterThan(0);
    expect(state.selectedPassengerId).toBe('adult-1');
    expect(state.context?.flightId).toBe('FL-100');
  });

  it('assigns seats, blocks occupied seats, and totals prices', () => {
    act(() => {
      useSeatSelectionStore.getState().initSelection({
        flightId: 'FL-100',
        passengers,
      });
    });

    const available = useSeatSelectionStore
      .getState()
      .seats.find((seat) => seat.status === 'AVAILABLE');
    const occupied = useSeatSelectionStore
      .getState()
      .seats.find((seat) => seat.status === 'OCCUPIED');

    expect(available).toBeDefined();
    expect(occupied).toBeDefined();

    act(() => {
      const blocked = useSeatSelectionStore.getState().selectSeat(occupied!.id);
      expect(blocked.ok).toBe(false);
    });

    act(() => {
      const result = useSeatSelectionStore.getState().selectSeat(available!.id);
      expect(result.ok).toBe(true);
    });

    expect(useSeatSelectionStore.getState().assignments).toEqual([
      { passengerId: 'adult-1', seatId: available!.id },
    ]);
    expect(useSeatSelectionStore.getState().totalPrice()).toBe(available!.price);
  });

  it('requires all adults and children before saving', () => {
    act(() => {
      useSeatSelectionStore.getState().initSelection({
        flightId: 'FL-100',
        passengers,
      });
    });

    act(() => {
      const result = useSeatSelectionStore.getState().saveSelection();
      expect(result.ok).toBe(false);
    });
    expect(useSeatSelectionStore.getState().saveStatus).toBe('error');

    const available = useSeatSelectionStore
      .getState()
      .seats.filter((seat) => seat.status === 'AVAILABLE' || seat.status === 'PREMIUM');

    act(() => {
      useSeatSelectionStore.getState().selectSeat(available[0]!.id);
      useSeatSelectionStore.getState().selectPassenger('child-1');
      useSeatSelectionStore.getState().selectSeat(available[1]!.id);
    });

    act(() => {
      const result = useSeatSelectionStore.getState().saveSelection();
      expect(result.ok).toBe(true);
    });
    expect(useSeatSelectionStore.getState().saveStatus).toBe('saved');
  });
});
