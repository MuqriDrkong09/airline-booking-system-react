import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Seat,
  SeatAssignment,
  SeatPassenger,
  SeatSelectionContext,
  SeatSelectionSaveStatus,
} from '../types/seat';
import { createAircraftSeatMap } from '../utils/createSeatMap';
import {
  applySeatSelection,
  calculateSeatPriceTotal,
  canPassengerSelectSeats,
} from '../utils/seatRules';

interface SeatSelectionState {
  context: SeatSelectionContext | null;
  seats: Seat[];
  passengers: SeatPassenger[];
  assignments: SeatAssignment[];
  selectedPassengerId: string | null;
  saveStatus: SeatSelectionSaveStatus;
  saveError: string | null;
  lastError: string | null;
  initSelection: (options: {
    flightId: string;
    aircraftModel?: string;
    passengers: SeatPassenger[];
  }) => void;
  selectPassenger: (passengerId: string) => void;
  selectSeat: (seatId: string) => { ok: true } | { ok: false; reason: string };
  clearSeatForPassenger: (passengerId: string) => void;
  clearAssignments: () => void;
  saveSelection: () => { ok: true } | { ok: false; message: string };
  clearSaveStatus: () => void;
  clearSelection: () => void;
  totalPrice: () => number;
}

function sameContext(
  left: SeatSelectionContext | null,
  flightId: string,
  aircraftModel: string,
): boolean {
  return Boolean(
    left && left.flightId === flightId && left.aircraftModel === aircraftModel,
  );
}

export const useSeatSelectionStore = create<SeatSelectionState>()(
  persist(
    (set, get) => ({
      context: null,
      seats: [],
      passengers: [],
      assignments: [],
      selectedPassengerId: null,
      saveStatus: 'idle',
      saveError: null,
      lastError: null,

      initSelection: ({ flightId, aircraftModel = 'Airbus A320', passengers }) => {
        const map = createAircraftSeatMap(aircraftModel);
        const eligible = passengers.filter(canPassengerSelectSeats);
        const current = get().context;

        if (
          sameContext(current, flightId, aircraftModel) &&
          get().seats.length > 0 &&
          get().passengers.length === passengers.length
        ) {
          const selectedStillValid = passengers.some(
            (passenger) => passenger.id === get().selectedPassengerId,
          );
          set({
            context: { flightId, aircraftModel },
            passengers,
            selectedPassengerId: selectedStillValid
              ? get().selectedPassengerId
              : (eligible[0]?.id ?? null),
            saveStatus: 'idle',
            saveError: null,
            lastError: null,
          });
          return;
        }

        set({
          context: { flightId, aircraftModel },
          seats: map.seats,
          passengers,
          assignments: [],
          selectedPassengerId: eligible[0]?.id ?? null,
          saveStatus: 'idle',
          saveError: null,
          lastError: null,
        });
      },

      selectPassenger: (passengerId) => {
        const passenger = get().passengers.find((item) => item.id === passengerId);
        if (!passenger || !canPassengerSelectSeats(passenger)) {
          set({ lastError: 'Infants do not get their own seat.' });
          return;
        }
        set({ selectedPassengerId: passengerId, lastError: null, saveStatus: 'idle' });
      },

      selectSeat: (seatId) => {
        const state = get();
        if (!state.selectedPassengerId) {
          const reason = 'Select a passenger before choosing a seat.';
          set({ lastError: reason, saveStatus: 'error', saveError: reason });
          return { ok: false, reason };
        }

        const result = applySeatSelection({
          seats: state.seats,
          assignments: state.assignments,
          passengerId: state.selectedPassengerId,
          seatId,
          passengers: state.passengers,
        });

        if (!result.ok) {
          set({ lastError: result.reason, saveStatus: 'error', saveError: result.reason });
          return { ok: false, reason: result.reason };
        }

        set({
          assignments: result.assignments,
          lastError: null,
          saveStatus: 'idle',
          saveError: null,
        });
        return { ok: true };
      },

      clearSeatForPassenger: (passengerId) => {
        set({
          assignments: get().assignments.filter(
            (assignment) => assignment.passengerId !== passengerId,
          ),
          saveStatus: 'idle',
          saveError: null,
          lastError: null,
        });
      },

      clearAssignments: () =>
        set({
          assignments: [],
          saveStatus: 'idle',
          saveError: null,
          lastError: null,
        }),

      saveSelection: () => {
        const { passengers, assignments } = get();
        const needing = passengers.filter(canPassengerSelectSeats);
        if (needing.length === 0) {
          const message = 'No seat-eligible passengers on this trip.';
          set({ saveStatus: 'error', saveError: message });
          return { ok: false, message };
        }
        if (assignments.length < needing.length) {
          const message = 'Assign a seat to every adult and child before continuing.';
          set({ saveStatus: 'error', saveError: message });
          return { ok: false, message };
        }
        set({ saveStatus: 'saved', saveError: null, lastError: null });
        return { ok: true };
      },

      clearSaveStatus: () => set({ saveStatus: 'idle', saveError: null }),

      clearSelection: () =>
        set({
          context: null,
          seats: [],
          passengers: [],
          assignments: [],
          selectedPassengerId: null,
          saveStatus: 'idle',
          saveError: null,
          lastError: null,
        }),

      totalPrice: () => calculateSeatPriceTotal(get().seats, get().assignments),
    }),
    {
      name: 'aerobook-seat-selection',
      partialize: (state) => ({
        context: state.context,
        seats: state.seats,
        passengers: state.passengers,
        assignments: state.assignments,
        selectedPassengerId: state.selectedPassengerId,
      }),
    },
  ),
);
