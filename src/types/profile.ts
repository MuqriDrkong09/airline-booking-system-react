export const CABIN_PREFERENCES = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First' },
] as const;

export const SEAT_PREFERENCES = [
  { value: 'NO_PREFERENCE', label: 'No preference' },
  { value: 'WINDOW', label: 'Window' },
  { value: 'AISLE', label: 'Aisle' },
] as const;

export const MEAL_PREFERENCES = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'VEGETARIAN', label: 'Vegetarian' },
  { value: 'VEGAN', label: 'Vegan' },
  { value: 'HALAL', label: 'Halal' },
  { value: 'KOSHER', label: 'Kosher' },
] as const;

export type CabinPreference = (typeof CABIN_PREFERENCES)[number]['value'];
export type SeatPreference = (typeof SEAT_PREFERENCES)[number]['value'];
export type MealPreference = (typeof MEAL_PREFERENCES)[number]['value'];

export interface TravelPreferences {
  preferredCabin: CabinPreference;
  seatPreference: SeatPreference;
  mealPreference: MealPreference;
  newsletterOptIn: boolean;
}

export const DEFAULT_TRAVEL_PREFERENCES: TravelPreferences = {
  preferredCabin: 'ECONOMY',
  seatPreference: 'NO_PREFERENCE',
  mealPreference: 'STANDARD',
  newsletterOptIn: true,
};

export interface UpdateProfileRequest {
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  travelPreferences: TravelPreferences;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
