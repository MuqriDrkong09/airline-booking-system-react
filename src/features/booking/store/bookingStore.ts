import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AddonSelection } from '@/features/addons/types/addon';
import type { PassengerBaggageSelection } from '@/features/baggage/types/baggage';
import type { CabinClass } from '@/features/flights';
import type { PassengerMealSelection } from '@/features/meals/types/meal';
import { calculateBookingTotal } from '@/features/addons/utils/addonRules';

export interface BookingState {
  flightId: string | null;
  cabinClass: CabinClass | null;
  baggage: PassengerBaggageSelection[];
  baggageTotal: number;
  meals: PassengerMealSelection[];
  mealTotal: number;
  addons: AddonSelection[];
  addonTotal: number;
  bookingTotal: number;
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
  setAddons: (options: {
    flightId: string;
    addons: AddonSelection[];
    addonTotal: number;
    bookingTotal: number;
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
  addons: [] as AddonSelection[],
  addonTotal: 0,
  bookingTotal: 0,
  updatedAt: null,
};

function withBookingTotal(partial: {
  baggageTotal?: number;
  mealTotal?: number;
  addonTotal?: number;
}): number {
  return calculateBookingTotal(partial);
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...empty,
      setBaggage: ({ flightId, cabinClass, baggage, baggageTotal }) => {
        const { mealTotal, addonTotal } = get();
        set({
          flightId,
          cabinClass,
          baggage,
          baggageTotal,
          bookingTotal: withBookingTotal({ baggageTotal, mealTotal, addonTotal }),
          updatedAt: new Date().toISOString(),
        });
      },
      setMeals: ({ flightId, meals, mealTotal }) => {
        const { cabinClass, baggageTotal, addonTotal } = get();
        set({
          flightId,
          cabinClass,
          meals,
          mealTotal,
          bookingTotal: withBookingTotal({ baggageTotal, mealTotal, addonTotal }),
          updatedAt: new Date().toISOString(),
        });
      },
      setAddons: ({ flightId, addons, addonTotal, bookingTotal }) =>
        set({
          flightId,
          cabinClass: get().cabinClass,
          addons,
          addonTotal,
          bookingTotal,
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
        addons: state.addons,
        addonTotal: state.addonTotal,
        bookingTotal: state.bookingTotal,
        updatedAt: state.updatedAt,
      }),
    },
  ),
);
