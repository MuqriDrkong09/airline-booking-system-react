import {
  addonsForPassenger,
  calculateAddonTotal,
  calculateBookingTotal,
  isAddonApplicable,
  removeAddon,
  selectAddon,
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

describe('addon rules', () => {
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
  });

  it('blocks unavailable or inapplicable add-ons', () => {
    const unavailable: Addon = {
      id: 'lounge-access',
      name: 'Lounge access',
      description: 'Airport lounge entry.',
      price: 55,
      availability: false,
      passengerApplicability: ['ADULT'],
    };
    expect(isAddonApplicable(unavailable, adult)).toBe(false);
    expect(
      isAddonApplicable(
        {
          ...unavailable,
          availability: true,
        },
        infant,
      ),
    ).toBe(false);
  });

  it('selects and removes add-ons and calculates totals', () => {
    let selections = selectAddon([], 'priority-boarding', adult.id);
    selections = selectAddon(selections, 'meals', adult.id);
    expect(calculateAddonTotal(selections)).toBe(33);

    selections = removeAddon(selections, 'meals', adult.id);
    expect(calculateAddonTotal(selections)).toBe(18);
    expect(calculateBookingTotal({ baggageTotal: 55, mealTotal: 10, addonTotal: 18 })).toBe(83);
  });

  it('validates passenger applicability on selections', () => {
    const invalid = validateAddonSelections({
      passengers: [infant],
      selections: [{ addonId: 'lounge-access', passengerId: infant.id }],
    });
    expect(invalid.ok).toBe(false);

    const valid = validateAddonSelections({
      passengers: [adult, infant],
      selections: [
        { addonId: 'lounge-access', passengerId: adult.id },
        { addonId: 'travel-insurance', passengerId: infant.id },
      ],
    });
    expect(valid.ok).toBe(true);
  });
});
