export type { MealCatalogItem, MealPassengerType, MealType } from './constants/meals';
export {
  formatMealPrice,
  MEAL_CATALOG,
  MEAL_TYPE_LABELS,
  MEAL_TYPES,
} from './constants/meals';
export type { MealPassenger, MealSaveStatus, PassengerMealSelection } from './types/meal';
export {
  assignPassengerMeal,
  calculateMealTotal,
  countMealDemand,
  defaultMealSelection,
  getMealCatalogItem,
  isMealSelectable,
  mealsForPassenger,
  pricePassengerMeal,
  removePassengerMeal,
  validateMealSelection,
} from './utils/mealRules';
export type { MealValidationResult } from './utils/mealRules';
export { MealOption } from './components/MealOption';
export type { MealOptionProps } from './components/MealOption';
export { MealSelector } from './components/MealSelector';
export type { MealSelectorProps } from './components/MealSelector';
export { MealSummary } from './components/MealSummary';
export type { MealSummaryProps } from './components/MealSummary';
export { MealSelectionPanel } from './components/MealSelectionPanel';
export type { MealSelectionPanelProps } from './components/MealSelectionPanel';
