export const PASSENGER_TYPES = ['ADULT', 'CHILD', 'INFANT'] as const;

export type PassengerType = (typeof PASSENGER_TYPES)[number];

export const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'UNSPECIFIED', label: 'Prefer not to say' },
] as const;

export type Gender = (typeof GENDERS)[number]['value'];

/** Age bands aligned with flight search passenger labels. */
export const PASSENGER_AGE = {
  ADULT_MIN_YEARS: 12,
  CHILD_MIN_YEARS: 2,
  INFANT_MAX_YEARS: 2,
} as const;

/** International travel often requires passport validity beyond the travel date. */
export const PASSPORT_VALIDITY_MONTHS_INTERNATIONAL = 6;

export const PASSENGER_TYPE_LABELS: Record<PassengerType, string> = {
  ADULT: 'Adult',
  CHILD: 'Child',
  INFANT: 'Infant',
};

export const PASSENGER_TYPE_HINTS: Record<PassengerType, string> = {
  ADULT: '12+ years on the departure date',
  CHILD: '2–11 years on the departure date',
  INFANT: 'Under 2 years on the departure date',
};
