export type AddonPassengerType = 'ADULT' | 'CHILD' | 'INFANT';

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  availability: boolean;
  /** Passenger types that may purchase this add-on. */
  passengerApplicability: readonly AddonPassengerType[];
}

export const ADDON_CATALOG: readonly Addon[] = [
  {
    id: 'preferred-seat',
    name: 'Preferred seat',
    description: 'Choose a preferred seat location at booking time.',
    price: 25,
    availability: true,
    passengerApplicability: ['ADULT', 'CHILD'],
  },
  {
    id: 'extra-legroom',
    name: 'Extra legroom',
    description: 'More space in exit-row or bulkhead seats.',
    price: 45,
    availability: true,
    passengerApplicability: ['ADULT', 'CHILD'],
  },
  {
    id: 'priority-boarding',
    name: 'Priority boarding',
    description: 'Board early and settle in before general boarding.',
    price: 18,
    availability: true,
    passengerApplicability: ['ADULT', 'CHILD'],
  },
  {
    id: 'lounge-access',
    name: 'Lounge access',
    description: 'Airport lounge entry with refreshments before departure.',
    price: 55,
    availability: true,
    passengerApplicability: ['ADULT'],
  },
  {
    id: 'travel-insurance',
    name: 'Travel insurance',
    description: 'Trip protection covering cancellation and medical emergencies.',
    price: 32,
    availability: true,
    passengerApplicability: ['ADULT', 'CHILD', 'INFANT'],
  },
  {
    id: 'additional-baggage',
    name: 'Additional baggage',
    description: 'One extra checked bag up to 20KG for this passenger.',
    price: 40,
    availability: true,
    passengerApplicability: ['ADULT', 'CHILD'],
  },
  {
    id: 'meals',
    name: 'Meals',
    description: 'Prepaid special meal package for this passenger.',
    price: 15,
    availability: true,
    passengerApplicability: ['ADULT', 'CHILD'],
  },
] as const;

export function formatAddonPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
