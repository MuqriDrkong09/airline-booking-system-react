import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CabinClass } from '@/features/flights';
import type { PassengerBaggageSelection } from '@/features/baggage/types/baggage';

export interface BookingState {
  flightId: string | null;
  cabinClass: CabinClass | null;
  baggage: PassengerBaggageSelection[];
  baggageTotal: number;
  updatedAt: string | null;
  setBaggage: (options: {
    flightId: string;
    cabinClass: CabinClass;
    baggage: PassengerBaggageSelection[];
    baggageTotal: number;
  }) => void;
  clearBooking: () => void;
}

const empty = {
  flightId: null,
  cabinClass: null,
  baggage: [] as PassengerBaggageSelection[],
  baggageTotal: 0,
  updatedAt: null,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...empty,
      setBaggage: ({ flightId, cabinClass, baggage, baggageTotal }) =>
        set({
          flightId,
          cabinClass,
          baggage,
          baggageTotal,
          updatedAt: new Date().toISOString(),
        }),
      clearBooking: () => set(empty),
    }),
    {
      name: 'aerobook-booking',
      partialize: (state) => ({
        flightId: state.flightId,
        cabinClass: state.cabinClass,
        baggage: state.baggage,
        baggageTotal: state.baggageTotal,
        updatedAt: state.updatedAt,
      }),
    },
  ),
);
