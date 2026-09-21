import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PassengerDraft,
  PassengerDraftSaveStatus,
  PassengerTripContext,
  PassengersFormValues,
} from '../types/passenger';
import { createPassengerSlots } from '../utils/createPassengerSlots';

interface PassengerDraftState {
  trip: PassengerTripContext | null;
  passengers: PassengerDraft[];
  saveStatus: PassengerDraftSaveStatus;
  saveError: string | null;
  lastSavedAt: string | null;
  initTrip: (trip: PassengerTripContext) => void;
  setPassengers: (passengers: PassengerDraft[]) => void;
  saveDraft: (values: PassengersFormValues) => { ok: true } | { ok: false; message: string };
  clearSaveStatus: () => void;
  clearDraft: () => void;
}

function sameTrip(left: PassengerTripContext, right: PassengerTripContext): boolean {
  return (
    left.flightId === right.flightId &&
    left.from === right.from &&
    left.to === right.to &&
    left.departure === right.departure &&
    left.counts.adults === right.counts.adults &&
    left.counts.children === right.counts.children &&
    left.counts.infants === right.counts.infants &&
    left.requiresPassport === right.requiresPassport
  );
}

export const usePassengerDraftStore = create<PassengerDraftState>()(
  persist(
    (set, get) => ({
      trip: null,
      passengers: [],
      saveStatus: 'idle',
      saveError: null,
      lastSavedAt: null,

      initTrip: (trip) => {
        const current = get().trip;
        if (current && sameTrip(current, trip) && get().passengers.length > 0) {
          set({ trip, saveStatus: 'idle', saveError: null });
          return;
        }

        set({
          trip,
          passengers: createPassengerSlots(trip.counts),
          saveStatus: 'idle',
          saveError: null,
          lastSavedAt: null,
        });
      },

      setPassengers: (passengers) => {
        set({
          passengers,
          saveStatus: 'idle',
          saveError: null,
        });
      },

      saveDraft: (values) => {
        const trip = get().trip;
        if (!trip) {
          const message = 'No trip selected. Return to flight details and try again.';
          set({ saveStatus: 'error', saveError: message });
          return { ok: false, message };
        }

        if (!values.passengers.length) {
          const message = 'Add passengers before saving.';
          set({ saveStatus: 'error', saveError: message });
          return { ok: false, message };
        }

        set({
          passengers: values.passengers,
          saveStatus: 'saved',
          saveError: null,
          lastSavedAt: new Date().toISOString(),
        });
        return { ok: true };
      },

      clearSaveStatus: () => set({ saveStatus: 'idle', saveError: null }),

      clearDraft: () =>
        set({
          trip: null,
          passengers: [],
          saveStatus: 'idle',
          saveError: null,
          lastSavedAt: null,
        }),
    }),
    {
      name: 'aerobook-passenger-draft',
      partialize: (state) => ({
        trip: state.trip,
        passengers: state.passengers,
        lastSavedAt: state.lastSavedAt,
      }),
    },
  ),
);
