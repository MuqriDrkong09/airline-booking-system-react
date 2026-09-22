import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PassengerBaggageSelection } from '@/features/baggage/types/baggage';
import type { CabinClass } from '@/features/flights';
import type { PassengerMealSelection } from '@/features/meals/types/meal';

export interface BookingState {
  flightId: string | null;
  cabinClass: CabinClass | null;
  baggage: PassengerBaggageSelection[];
  baggageTotal: number;
  meals: PassengerMealSelection[];
  mealTotal: number;
  updatedAt: string | null;
  setBaggage: (options: {
    flightId: string;
    cabinClass: CabinClass;
    baggage: PassengerBaggageSelection[];
    baggageTotal: number;
  }) => void;
  setMeals: (options: {
    flightId: string;
    meals: PassengerMealSelection[];
    mealTotal: number;
  }) => void;
  clearBooking: () => void;
}

const empty = {
  flightId: null,
  cabinClass: null,
  baggage: [] as PassengerBaggageSelection[],
  baggageTotal: 0,
  meals: [] as PassengerMealSelection[],
  mealTotal: 0,
  updatedAt: null,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...empty,
      setBaggage: ({ flightId, cabinClass, baggage, baggageTotal }) =>
        set({
          flightId,
          cabinClass,
          baggage,
          baggageTotal,
          updatedAt: new Date().toISOString(),
        }),
      setMeals: ({ flightId, meals, mealTotal }) =>
        set({
          flightId,
          cabinClass: get().cabinClass,
          meals,
          mealTotal,
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
        meals: state.meals,
        mealTotal: state.mealTotal,
        updatedAt: state.updatedAt,
      }),
    },
  ),
);
