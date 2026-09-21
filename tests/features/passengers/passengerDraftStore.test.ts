import { act } from '@testing-library/react';
import { createPassengerSlots, usePassengerDraftStore } from '@/features/passengers';

describe('usePassengerDraftStore', () => {
  beforeEach(() => {
    act(() => {
      usePassengerDraftStore.getState().clearDraft();
      usePassengerDraftStore.persist.clearStorage();
    });
  });

  it('initializes passenger slots from trip counts', () => {
    act(() => {
      usePassengerDraftStore.getState().initTrip({
        flightId: 'flt-1',
        from: 'KUL',
        to: 'SIN',
        departure: '2026-10-20',
        counts: { adults: 1, children: 1, infants: 0 },
        requiresPassport: true,
      });
    });

    const state = usePassengerDraftStore.getState();
    expect(state.passengers.map((passenger) => passenger.type)).toEqual(['ADULT', 'CHILD']);
    expect(state.saveStatus).toBe('idle');
  });

  it('keeps an existing draft when re-initializing the same trip', () => {
    act(() => {
      usePassengerDraftStore.getState().initTrip({
        flightId: 'flt-1',
        from: 'KUL',
        to: 'SIN',
        departure: '2026-10-20',
        counts: { adults: 1, children: 0, infants: 0 },
        requiresPassport: true,
      });
      const [first] = usePassengerDraftStore.getState().passengers;
      usePassengerDraftStore.getState().setPassengers([
        { ...first!, firstName: 'Alex' },
      ]);
      usePassengerDraftStore.getState().initTrip({
        flightId: 'flt-1',
        from: 'KUL',
        to: 'SIN',
        departure: '2026-10-20',
        counts: { adults: 1, children: 0, infants: 0 },
        requiresPassport: true,
      });
    });

    expect(usePassengerDraftStore.getState().passengers[0]?.firstName).toBe('Alex');
  });

  it('saves validated passenger values and records success state', () => {
    const passengers = createPassengerSlots({ adults: 1, children: 0, infants: 0 });

    act(() => {
      usePassengerDraftStore.getState().initTrip({
        flightId: 'flt-1',
        from: 'KUL',
        to: 'SIN',
        departure: '2026-10-20',
        counts: { adults: 1, children: 0, infants: 0 },
        requiresPassport: true,
      });
      const result = usePassengerDraftStore.getState().saveDraft({
        passengers: [
          {
            ...passengers[0]!,
            title: 'MR',
            firstName: 'Alex',
            lastName: 'Traveler',
          },
        ],
      });
      expect(result.ok).toBe(true);
    });

    const state = usePassengerDraftStore.getState();
    expect(state.saveStatus).toBe('saved');
    expect(state.passengers[0]?.firstName).toBe('Alex');
    expect(state.lastSavedAt).toBeTruthy();
  });

  it('returns an error state when saving without a trip', () => {
    let result: { ok: boolean; message?: string } | undefined;
    act(() => {
      result = usePassengerDraftStore.getState().saveDraft({
        passengers: createPassengerSlots({ adults: 1, children: 0, infants: 0 }),
      });
    });

    expect(result?.ok).toBe(false);
    expect(usePassengerDraftStore.getState().saveStatus).toBe('error');
    expect(usePassengerDraftStore.getState().saveError).toMatch(/No trip selected/i);
  });
});
