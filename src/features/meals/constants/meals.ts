export const MEAL_TYPES = [
  'STANDARD',
  'VEGETARIAN',
  'VEGAN',
  'HALAL',
  'KOSHER',
  'GLUTEN_FREE',
  'CHILD',
] as const;

export type MealType = (typeof MEAL_TYPES)[number];

export type MealPassengerType = 'ADULT' | 'CHILD' | 'INFANT';

export interface MealCatalogItem {
  type: MealType;
  label: string;
  description: string;
  price: number;
  available: boolean;
  /** Remaining servings for this flight (0 = sold out). */
  remaining: number;
  maxQuantityPerPassenger: number;
  allowedPassengerTypes: readonly MealPassengerType[];
}

export const MEAL_CATALOG: readonly MealCatalogItem[] = [
  {
    type: 'STANDARD',
    label: 'Standard Meal',
    description: 'Chef’s main course with side and dessert.',
    price: 0,
    available: true,
    remaining: 120,
    maxQuantityPerPassenger: 2,
    allowedPassengerTypes: ['ADULT', 'CHILD'],
  },
  {
    type: 'VEGETARIAN',
    label: 'Vegetarian',
    description: 'Lactose-friendly vegetarian entrée.',
    price: 0,
    available: true,
    remaining: 40,
    maxQuantityPerPassenger: 2,
    allowedPassengerTypes: ['ADULT', 'CHILD'],
  },
  {
    type: 'VEGAN',
    label: 'Vegan',
    description: 'Plant-based meal without animal products.',
    price: 5,
    available: true,
    remaining: 25,
    maxQuantityPerPassenger: 2,
    allowedPassengerTypes: ['ADULT', 'CHILD'],
  },
  {
    type: 'HALAL',
    label: 'Halal',
    description: 'Certified halal preparation.',
    price: 0,
    available: true,
    remaining: 30,
    maxQuantityPerPassenger: 2,
    allowedPassengerTypes: ['ADULT', 'CHILD'],
  },
  {
    type: 'KOSHER',
    label: 'Kosher',
    description: 'Sealed kosher meal service.',
    price: 8,
    available: true,
    remaining: 12,
    maxQuantityPerPassenger: 1,
    allowedPassengerTypes: ['ADULT', 'CHILD'],
  },
  {
    type: 'GLUTEN_FREE',
    label: 'Gluten Free',
    description: 'Prepared without gluten-containing ingredients.',
    price: 6,
    available: true,
    remaining: 18,
    maxQuantityPerPassenger: 2,
    allowedPassengerTypes: ['ADULT', 'CHILD'],
  },
  {
    type: 'CHILD',
    label: 'Child Meal',
    description: 'Kid-friendly portion with mild flavors.',
    price: 0,
    available: true,
    remaining: 20,
    maxQuantityPerPassenger: 2,
    allowedPassengerTypes: ['CHILD'],
  },
] as const;

export const MEAL_TYPE_LABELS: Readonly<Record<MealType, string>> = Object.fromEntries(
  MEAL_CATALOG.map((item) => [item.type, item.label]),
) as Readonly<Record<MealType, string>>;

export function formatMealPrice(price: number, currency = 'USD'): string {
  if (price <= 0) {
    return 'Included';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
