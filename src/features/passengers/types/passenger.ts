import type { Gender, PassengerType } from '../constants/passenger';

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface PassengerDraft {
  id: string;
  type: PassengerType;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender | '';
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  email: string;
  phone: string;
  /** Required for infants — id of the accompanying adult. */
  associatedAdultId: string;
}

export interface PassengersFormValues {
  passengers: PassengerDraft[];
}

export interface PassengerTripContext {
  flightId: string;
  from: string;
  to: string;
  departure: string;
  counts: PassengerCounts;
  requiresPassport: boolean;
}

export type PassengerDraftSaveStatus = 'idle' | 'saving' | 'saved' | 'error';
