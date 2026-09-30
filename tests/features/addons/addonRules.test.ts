import {
  addonsForPassenger,
  calculateAddonTotal,
  calculateBookingTotal,
  getAddonById,
  hasAddonSelection,
  isAddonApplicable,
  removeAddon,
  selectAddon,
  toggleAddon,
  validateAddonSelections,
} from '@/features/addons';
import type { Addon, AddonPassenger } from '@/features/addons';

const adult: AddonPassenger = {
  id: 'adult-1',
  type: 'ADULT',
  displayName: 'Ada Lovelace',
};

const child: AddonPassenger = {
  id: 'child-1',
  type: 'CHILD',
  displayName: 'Alan Turing',
};

const infant: AddonPassenger = {
  id: 'infant-1',
  type: 'INFANT',
  displayName: 'Grace Hopper',
};

const unavailableLounge: Addon = {
  id: 'lounge-access',
  name: 'Lounge access',
  description: 'Airport lounge entry.',
  price: 55,
  availability: false,
  passengerApplicability: ['ADULT'],
};

describe('addon rules', () => {
  it('looks up add-ons by id from the catalog', () => {
    expect(getAddonById('priority-boarding')?.name).toBe('Priority boarding');
    expect(getAddonById('missing-addon')).toBeUndefined();
    expect(getAddonById('lounge-access', [unavailableLounge])?.id).toBe('lounge-access');
  });

  it('filters add-ons by passenger applicability', () => {
    const adultIds = addonsForPassenger(adult).map((addon) => addon.id);
    const infantIds = addonsForPassenger(infant).map((addon) => addon.id);

    expect(adultIds).toEqual(
      expect.arrayContaining([
        'preferred-seat',
        'extra-legroom',
        'priority-boarding',
        'lounge-access',
        'travel-insurance',
        'additional-baggage',
        'meals',
      ]),
    );
    expect(infantIds).toEqual(['travel-insurance']);
    expect(addonsForPassenger(child).map((addon) => addon.id)).not.toContain('lounge-access');
    expect(addonsForPassenger(adult, [unavailableLounge])).toEqual([]);
  });

  it('blocks unavailable or inapplicable add-ons', () => {
    expect(isAddonApplicable(unavailableLounge, adult)).toBe(false);
    expect(
      isAddonApplicable(
        {
          ...unavailableLounge,
          availability: true,
        },
        infant,
      ),
    ).toBe(false);
    expect(
      isAddonApplicable(
        {
          ...unavailableLounge,
          availability: true,
        },
        adult,
      ),
    ).toBe(true);
  });

  it('detects existing selections and avoids duplicate selects', () => {
    const selections = [{ addonId: 'priority-boarding', passengerId: adult.id }];

    expect(hasAddonSelection(selections, 'priority-boarding', adult.id)).toBe(true);
    expect(hasAddonSelection(selections, 'priority-boarding', child.id)).toBe(false);
    expect(selectAddon(selections, 'priority-boarding', adult.id)).toBe(selections);
  });

  it('selects, removes, and toggles add-ons and calculates totals', () => {
    let selections = selectAddon([], 'priority-boarding', adult.id);
    selections = selectAddon(selections, 'meals', adult.id);
    expect(calculateAddonTotal(selections)).toBe(33);

    selections = removeAddon(selections, 'meals', adult.id);
    expect(calculateAddonTotal(selections)).toBe(18);

    selections = toggleAddon(selections, 'meals', adult.id);
    expect(hasAddonSelection(selections, 'meals', adult.id)).toBe(true);
    selections = toggleAddon(selections, 'meals', adult.id);
    expect(hasAddonSelection(selections, 'meals', adult.id)).toBe(false);

    expect(calculateAddonTotal([{ addonId: 'unknown', passengerId: adult.id }])).toBe(0);
    expect(calculateBookingTotal({})).toBe(0);
    expect(
      calculateBookingTotal({
        baggageTotal: 55,
        mealTotal: 10,
        addonTotal: 18,
        seatTotal: 12,
      }),
    ).toBe(95);
  });

  it('validates passenger applicability on selections', () => {
    const invalid = validateAddonSelections({
      passengers: [infant],
      selections: [{ addonId: 'lounge-access', passengerId: infant.id }],
    });
    expect(invalid).toEqual({
      ok: false,
      message: 'Lounge access cannot be assigned to Grace Hopper.',
    });

    const valid = validateAddonSelections({
      passengers: [adult, infant],
      selections: [
        { addonId: 'lounge-access', passengerId: adult.id },
        { addonId: 'travel-insurance', passengerId: infant.id },
      ],
    });
    expect(valid).toEqual({ ok: true });
  });

  it('rejects unknown passengers, unknown add-ons, and unavailable add-ons', () => {
    expect(
      validateAddonSelections({
        passengers: [adult],
        selections: [{ addonId: 'priority-boarding', passengerId: 'missing' }],
      }),
    ).toEqual({
      ok: false,
      message: 'An add-on is assigned to an unknown passenger.',
    });

    expect(
      validateAddonSelections({
        passengers: [adult],
        selections: [{ addonId: 'not-real', passengerId: adult.id }],
      }),
    ).toEqual({
      ok: false,
      message: 'Unknown add-on: not-real.',
    });

    expect(
      validateAddonSelections({
        passengers: [adult],
        selections: [{ addonId: 'lounge-access', passengerId: adult.id }],
        catalog: [unavailableLounge],
      }),
    ).toEqual({
      ok: false,
      message: 'Lounge access is unavailable.',
    });
  });
});
