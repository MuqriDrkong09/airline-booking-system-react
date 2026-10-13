import {
  countPassengersByType,
  createEmptyPassenger,
  createPassengerSlots,
  passengerCountsMatch,
} from '@/features/passengers/utils/createPassengerSlots';

describe('createPassengerSlots', () => {
  it('builds ordered adult, child, and infant slots', () => {
    const slots = createPassengerSlots({ adults: 2, children: 1, infants: 1 });

    expect(slots.map((slot) => slot.id)).toEqual(['adult-1', 'adult-2', 'child-1', 'infant-1']);
    expect(slots.map((slot) => slot.type)).toEqual(['ADULT', 'ADULT', 'CHILD', 'INFANT']);
  });

  it('creates empty passenger drafts with blank required fields', () => {
    expect(createEmptyPassenger('CHILD', 0)).toMatchObject({
      id: 'child-1',
      type: 'CHILD',
      firstName: '',
      passportNumber: '',
      associatedAdultId: '',
    });
  });

  it('counts passengers by type and compares expected search counts', () => {
    const slots = createPassengerSlots({ adults: 1, children: 2, infants: 0 });
    const counts = countPassengersByType(slots);

    expect(counts).toEqual({ adults: 1, children: 2, infants: 0 });
    expect(passengerCountsMatch(counts, { adults: 1, children: 2, infants: 0 })).toBe(true);
    expect(passengerCountsMatch(counts, { adults: 2, children: 2, infants: 0 })).toBe(false);
  });
});
