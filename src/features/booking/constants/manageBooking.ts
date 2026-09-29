/** Flat change fee charged per fare-paying passenger when switching flights. */
export const FLIGHT_CHANGE_FEE_PER_PASSENGER = 50;

export type ManageBookingSection =
  | 'overview'
  | 'seats'
  | 'baggage'
  | 'meals'
  | 'addons'
  | 'contact'
  | 'flight';

export const MANAGE_BOOKING_SECTIONS: readonly {
  id: ManageBookingSection;
  label: string;
  description: string;
}[] = [
  {
    id: 'seats',
    label: 'Change seat',
    description: 'Pick new seats on the same aircraft map.',
  },
  {
    id: 'baggage',
    label: 'Add baggage',
    description: 'Update cabin, checked, and extra baggage.',
  },
  {
    id: 'meals',
    label: 'Add meals',
    description: 'Choose or change in-flight meals.',
  },
  {
    id: 'addons',
    label: 'Add add-ons',
    description: 'Lounge, priority boarding, and other extras.',
  },
  {
    id: 'contact',
    label: 'Update contact details',
    description: 'Email and phone for each traveler.',
  },
  {
    id: 'flight',
    label: 'Change flight',
    description: 'Search a new flight when the fare allows changes.',
  },
] as const;

export const CHANGE_BOOKING_QUERY = 'changeBooking';
