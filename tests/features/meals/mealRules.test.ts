import {
  assignPassengerMeal,
  calculateMealTotal,
  isMealSelectable,
  mealsForPassenger,
  pricePassengerMeal,
  removePassengerMeal,
  validateMealSelection,
} from '@/features/meals';
import type { MealCatalogItem, MealPassenger, PassengerMealSelection } from '@/features/meals';

const adult: MealPassenger = {
  id: 'adult-1',
  type: 'ADULT',
  displayName: 'Ada Lovelace',
};

const child: MealPassenger = {
  id: 'child-1',
  type: 'CHILD',
  displayName: 'Alan Turing',
};

const infant: MealPassenger = {
  id: 'infant-1',
  type: 'INFANT',
  displayName: 'Grace Hopper',
};

describe('meal rules', () => {
  it('lists child meal only for children and no meals for infants', () => {
    const adultMeals = mealsForPassenger(adult).map((meal) => meal.type);
    const childMeals = mealsForPassenger(child).map((meal) => meal.type);

    expect(adultMeals).not.toContain('CHILD');
    expect(childMeals).toContain('CHILD');
    expect(mealsForPassenger(infant)).toEqual([]);
  });

  it('blocks unavailable meals', () => {
    const soldOut: MealCatalogItem = {
      type: 'KOSHER',
      label: 'Kosher',
      description: 'Sealed kosher meal service.',
      price: 8,
      available: false,
      remaining: 0,
      maxQuantityPerPassenger: 1,
      allowedPassengerTypes: ['ADULT', 'CHILD'],
    };
    expect(isMealSelectable(soldOut, adult)).toBe(false);
  });

  it('calculates meal prices from type and quantity', () => {
    const selection: PassengerMealSelection = {
      passengerId: adult.id,
      mealType: 'VEGAN',
      quantity: 2,
    };
    expect(pricePassengerMeal(selection)).toBe(10);
    expect(calculateMealTotal([selection])).toBe(10);
  });

  it('assigns and removes meals per passenger', () => {
    const empty: PassengerMealSelection[] = [
      { passengerId: adult.id, mealType: null, quantity: 0 },
    ];
    const assigned = assignPassengerMeal({
      selections: empty,
      passengerId: adult.id,
      mealType: 'HALAL',
      quantity: 1,
    });
    expect(assigned[0]).toEqual({
      passengerId: adult.id,
      mealType: 'HALAL',
      quantity: 1,
    });
    expect(removePassengerMeal(assigned, adult.id)[0]).toEqual({
      passengerId: adult.id,
      mealType: null,
      quantity: 0,
    });
  });

  it('rejects child meal for adults and meals for infants', () => {
    const adultChildMeal = validateMealSelection({
      passengers: [adult],
      selections: [{ passengerId: adult.id, mealType: 'CHILD', quantity: 1 }],
    });
    expect(adultChildMeal.ok).toBe(false);

    const infantMeal = validateMealSelection({
      passengers: [infant],
      selections: [{ passengerId: infant.id, mealType: 'STANDARD', quantity: 1 }],
    });
    expect(infantMeal.ok).toBe(false);
  });

  it('accepts a valid adult meal selection', () => {
    const result = validateMealSelection({
      passengers: [adult],
      selections: [{ passengerId: adult.id, mealType: 'GLUTEN_FREE', quantity: 1 }],
    });
    expect(result.ok).toBe(true);
  });

  it('rejects demand above remaining stock', () => {
    const limited: MealCatalogItem[] = [
      {
        type: 'KOSHER',
        label: 'Kosher',
        description: 'Sealed kosher meal service.',
        price: 8,
        available: true,
        remaining: 1,
        maxQuantityPerPassenger: 2,
        allowedPassengerTypes: ['ADULT', 'CHILD'],
      },
    ];
    const result = validateMealSelection({
      passengers: [adult, child],
      selections: [
        { passengerId: adult.id, mealType: 'KOSHER', quantity: 1 },
        { passengerId: child.id, mealType: 'KOSHER', quantity: 1 },
      ],
      catalog: limited,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/1 Kosher/i);
    }
  });
});
