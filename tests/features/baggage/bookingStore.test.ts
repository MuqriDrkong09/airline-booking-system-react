import { act } from '@testing-library/react';
import { useBookingStore } from '@/features/booking';

describe('booking store', () => {
  beforeEach(() => {
    act(() => {
      useBookingStore.getState().clearBooking();
      void useBookingStore.persist.clearStorage();
    });
  });

  it('updates booking state when baggage changes', () => {
    act(() => {
      useBookingStore.getState().setBaggage({
        flightId: 'FL-100',
        cabinClass: 'ECONOMY',
        baggage: [
          {
            passengerId: 'adult-1',
            cabinKg: 7,
            checkedKg: 30,
            additionalKg: 0,
          },
        ],
        baggageTotal: 55,
      });
    });

    const state = useBookingStore.getState();
    expect(state.flightId).toBe('FL-100');
    expect(state.baggageTotal).toBe(55);
    expect(state.baggage[0]?.checkedKg).toBe(30);
    expect(state.updatedAt).toEqual(expect.any(String));
  });

  it('updates booking state when meals change', () => {
    act(() => {
      useBookingStore.getState().setMeals({
        flightId: 'FL-100',
        meals: [{ passengerId: 'adult-1', mealType: 'VEGAN', quantity: 2 }],
        mealTotal: 10,
      });
    });

    const state = useBookingStore.getState();
    expect(state.flightId).toBe('FL-100');
    expect(state.mealTotal).toBe(10);
    expect(state.meals[0]?.mealType).toBe('VEGAN');
  });

  it('updates add-ons and booking total', () => {
    act(() => {
      useBookingStore.getState().setBaggage({
        flightId: 'FL-100',
        cabinClass: 'ECONOMY',
        baggage: [],
        baggageTotal: 55,
      });
      useBookingStore.getState().setMeals({
        flightId: 'FL-100',
        meals: [],
        mealTotal: 10,
      });
      useBookingStore.getState().setAddons({
        flightId: 'FL-100',
        addons: [{ addonId: 'priority-boarding', passengerId: 'adult-1' }],
        addonTotal: 18,
        bookingTotal: 83,
      });
    });

    const state = useBookingStore.getState();
    expect(state.addons).toHaveLength(1);
    expect(state.addonTotal).toBe(18);
    expect(state.bookingTotal).toBe(83);
  });
});
