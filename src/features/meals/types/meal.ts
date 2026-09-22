import type { MealType } from '../constants/meals';

export interface MealPassenger {
  id: string;
  type: 'ADULT' | 'CHILD' | 'INFANT';
  displayName: string;
}

/** One meal choice per passenger. `mealType` null means no meal / removed. */
export interface PassengerMealSelection {
  passengerId: string;
  mealType: MealType | null;
  quantity: number;
}

export type MealSaveStatus = 'idle' | 'saved' | 'error';
