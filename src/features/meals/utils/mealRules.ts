import {
  MEAL_CATALOG,
  type MealCatalogItem,
  type MealType,
} from '../constants/meals';
import type { MealPassenger, PassengerMealSelection } from '../types/meal';

export function getMealCatalogItem(type: MealType): MealCatalogItem | undefined {
  return MEAL_CATALOG.find((item) => item.type === type);
}

export function mealsForPassenger(
  passenger: MealPassenger,
  catalog: readonly MealCatalogItem[] = MEAL_CATALOG,
): MealCatalogItem[] {
  if (passenger.type === 'INFANT') {
    return [];
  }
  return catalog.filter((item) => item.allowedPassengerTypes.includes(passenger.type));
}

export function isMealSelectable(
  item: MealCatalogItem,
  passenger: MealPassenger,
): boolean {
  if (!item.available || item.remaining <= 0) {
    return false;
  }
  if (passenger.type === 'INFANT') {
    return false;
  }
  return item.allowedPassengerTypes.includes(passenger.type);
}

export function defaultMealSelection(passengerId: string): PassengerMealSelection {
  return {
    passengerId,
    mealType: null,
    quantity: 0,
  };
}

export function pricePassengerMeal(
  selection: PassengerMealSelection,
  catalog: readonly MealCatalogItem[] = MEAL_CATALOG,
): number {
  if (!selection.mealType || selection.quantity <= 0) {
    return 0;
  }
  const item = catalog.find((meal) => meal.type === selection.mealType);
  if (!item) {
    return 0;
  }
  return item.price * selection.quantity;
}

export function calculateMealTotal(
  selections: PassengerMealSelection[],
  catalog: readonly MealCatalogItem[] = MEAL_CATALOG,
): number {
  return selections.reduce((sum, selection) => sum + pricePassengerMeal(selection, catalog), 0);
}

export function countMealDemand(
  selections: PassengerMealSelection[],
  mealType: MealType,
): number {
  return selections.reduce((sum, selection) => {
    if (selection.mealType !== mealType) {
      return sum;
    }
    return sum + Math.max(0, selection.quantity);
  }, 0);
}

export type MealValidationResult = { ok: true } | { ok: false; message: string };

export function validateMealSelection(options: {
  selections: PassengerMealSelection[];
  passengers: MealPassenger[];
  catalog?: readonly MealCatalogItem[];
}): MealValidationResult {
  const { selections, passengers, catalog = MEAL_CATALOG } = options;
  const byId = new Map(selections.map((selection) => [selection.passengerId, selection]));

  for (const passenger of passengers) {
    const selection = byId.get(passenger.id) ?? defaultMealSelection(passenger.id);

    if (passenger.type === 'INFANT') {
      if (selection.mealType || selection.quantity > 0) {
        return {
          ok: false,
          message: `${passenger.displayName} cannot be assigned a meal.`,
        };
      }
      continue;
    }

    if (!selection.mealType) {
      if (selection.quantity > 0) {
        return {
          ok: false,
          message: `Choose a meal type for ${passenger.displayName}.`,
        };
      }
      continue;
    }

    const item = catalog.find((meal) => meal.type === selection.mealType);
    if (!item) {
      return { ok: false, message: `Unknown meal for ${passenger.displayName}.` };
    }

    if (!isMealSelectable(item, passenger)) {
      return {
        ok: false,
        message: `${item.label} is not available for ${passenger.displayName}.`,
      };
    }

    if (selection.quantity < 1) {
      return {
        ok: false,
        message: `Set a quantity for ${passenger.displayName}'s meal.`,
      };
    }

    if (selection.quantity > item.maxQuantityPerPassenger) {
      return {
        ok: false,
        message: `Max ${item.maxQuantityPerPassenger} ${item.label} per passenger.`,
      };
    }
  }

  for (const item of catalog) {
    const demand = countMealDemand(selections, item.type);
    if (demand > item.remaining) {
      return {
        ok: false,
        message: `Only ${item.remaining} ${item.label} meal${item.remaining === 1 ? '' : 's'} left.`,
      };
    }
  }

  return { ok: true };
}

export function removePassengerMeal(
  selections: PassengerMealSelection[],
  passengerId: string,
): PassengerMealSelection[] {
  return selections.map((selection) =>
    selection.passengerId === passengerId
      ? defaultMealSelection(passengerId)
      : selection,
  );
}

export function assignPassengerMeal(options: {
  selections: PassengerMealSelection[];
  passengerId: string;
  mealType: MealType;
  quantity?: number;
}): PassengerMealSelection[] {
  const { selections, passengerId, mealType, quantity = 1 } = options;
  return selections.map((selection) =>
    selection.passengerId === passengerId
      ? {
          passengerId,
          mealType,
          quantity: Math.max(1, quantity),
        }
      : selection,
  );
}
