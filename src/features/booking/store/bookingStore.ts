import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AddonSelection } from '@/features/addons/types/addon';
import { calculateAddonTotal } from '@/features/addons/utils/addonRules';
import type { PassengerBaggageSelection } from '@/features/baggage/types/baggage';
import type { CabinClass, FlightOffer, FlightSearchCriteria } from '@/features/flights';
import type { PassengerMealSelection } from '@/features/meals/types/meal';
import type { PassengerDraft } from '@/features/passengers';
import type {
  BookingData,
  BookingPaymentInfo,
  BookingPromoCode,
  BookingSeatSelection,
  CheckoutStatus,
} from '../types/booking';
import { EMPTY_PRICE_BREAKDOWN } from '../types/booking';
import {
  priceBreakdownFromBooking,
  toSafePaymentInfo,
} from '../utils/priceBreakdown';

export interface BookingState extends BookingData {
  setSearchCriteria: (criteria: FlightSearchCriteria | null) => void;
  setSelectedFlight: (flight: FlightOffer | null, cabinClass?: CabinClass | null) => void;
  setPassengers: (passengers: PassengerDraft[]) => void;
  setSeats: (seats: BookingSeatSelection[]) => void;
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
    bookingTotal?: number;
  }) => void;
  setPromoCode: (promo: BookingPromoCode | null) => void;
  /** Accepts only safe payment fields; sensitive card data is stripped. */
  setPayment: (payment: Partial<BookingPaymentInfo> & Record<string, unknown>) => void;
  setBookingReference: (reference: string | null) => void;
  setBookingStatus: (status: CheckoutStatus) => void;
  clearBooking: () => void;
}

const empty: BookingData = {
  searchCriteria: null,
  selectedFlight: null,
  flightId: null,
  cabinClass: null,
  passengers: [],
  seats: [],
  baggage: [],
  meals: [],
  addons: [],
  seatTotal: 0,
  baggageTotal: 0,
  mealTotal: 0,
  addonTotal: 0,
  promoCode: null,
  payment: null,
  priceBreakdown: { ...EMPTY_PRICE_BREAKDOWN },
  bookingReference: null,
  bookingStatus: 'DRAFT',
  updatedAt: null,
};

function withTotals(state: BookingData): Pick<
  BookingData,
  'seatTotal' | 'addonTotal' | 'priceBreakdown' | 'updatedAt'
> {
  const priceBreakdown = priceBreakdownFromBooking(state);
  return {
    seatTotal: priceBreakdown.seatCost,
    addonTotal: priceBreakdown.addonCost,
    priceBreakdown,
    updatedAt: new Date().toISOString(),
  };
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...empty,

      setSearchCriteria: (searchCriteria) => {
        const current = get();
        set({
          searchCriteria,
          ...withTotals({ ...current, searchCriteria }),
        });
      },

      setSelectedFlight: (selectedFlight, cabinClass) => {
        const current = get();
        const nextCabin =
          cabinClass ?? selectedFlight?.cabinClass ?? current.cabinClass ?? null;
        const next = {
          ...current,
          selectedFlight,
          flightId: selectedFlight?.id ?? null,
          cabinClass: nextCabin,
        };
        set({
          selectedFlight,
          flightId: next.flightId,
          cabinClass: nextCabin,
          ...withTotals(next),
        });
      },

      setPassengers: (passengers) => {
        const current = get();
        const next = { ...current, passengers };
        set({
          passengers,
          ...withTotals(next),
        });
      },

      setSeats: (seats) => {
        const current = get();
        const next = { ...current, seats };
        set({
          seats,
          ...withTotals(next),
        });
      },

      setBaggage: ({ flightId, cabinClass, baggage, baggageTotal }) => {
        const current = get();
        const next = {
          ...current,
          flightId,
          cabinClass,
          baggage,
          baggageTotal,
        };
        set({
          flightId,
          cabinClass,
          baggage,
          baggageTotal,
          ...withTotals(next),
        });
      },

      setMeals: ({ flightId, meals, mealTotal }) => {
        const current = get();
        const next = {
          ...current,
          flightId,
          meals,
          mealTotal,
        };
        set({
          flightId,
          cabinClass: current.cabinClass,
          meals,
          mealTotal,
          ...withTotals(next),
        });
      },

      setAddons: ({ flightId, addons, addonTotal }) => {
        const current = get();
        const resolvedAddonTotal = addonTotal ?? calculateAddonTotal(addons);
        const next = {
          ...current,
          flightId,
          addons,
          addonTotal: resolvedAddonTotal,
        };
        set({
          flightId,
          cabinClass: current.cabinClass,
          addons,
          ...withTotals(next),
        });
      },

      setPromoCode: (promoCode) => {
        const current = get();
        const next = { ...current, promoCode };
        set({
          promoCode,
          ...withTotals(next),
        });
      },

      setPayment: (payment) => {
        set({
          payment: toSafePaymentInfo(payment),
          updatedAt: new Date().toISOString(),
        });
      },

      setBookingReference: (bookingReference) =>
        set({
          bookingReference,
          updatedAt: new Date().toISOString(),
        }),

      setBookingStatus: (bookingStatus) =>
        set({
          bookingStatus,
          updatedAt: new Date().toISOString(),
        }),

      clearBooking: () => set({ ...empty, priceBreakdown: { ...EMPTY_PRICE_BREAKDOWN } }),
    }),
    {
      name: 'aerobook-booking',
      partialize: (state) => ({
        searchCriteria: state.searchCriteria,
        selectedFlight: state.selectedFlight,
        flightId: state.flightId,
        cabinClass: state.cabinClass,
        passengers: state.passengers,
        seats: state.seats,
        baggage: state.baggage,
        meals: state.meals,
        addons: state.addons,
        seatTotal: state.seatTotal,
        baggageTotal: state.baggageTotal,
        mealTotal: state.mealTotal,
        addonTotal: state.addonTotal,
        promoCode: state.promoCode,
        // Safe payment snapshot only (method, last4, brand, billing contact).
        payment: state.payment
          ? toSafePaymentInfo(state.payment as BookingPaymentInfo & Record<string, unknown>)
          : null,
        priceBreakdown: state.priceBreakdown,
        bookingReference: state.bookingReference,
        bookingStatus: state.bookingStatus,
        updatedAt: state.updatedAt,
      }),
    },
  ),
);

/** @deprecated Prefer selectFinalTotal — kept for panels that read bookingTotal. */
export function selectLegacyBookingTotal(state: BookingData): number {
  return state.priceBreakdown.finalTotal;
}
