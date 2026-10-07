import type { PassengerDraft } from '@/features/passengers/types/passenger';

export interface PassengerApi {
  listPassengers(): Promise<PassengerDraft[]>;
  getPassenger(passengerId: string): Promise<PassengerDraft>;
  savePassengers(passengers: PassengerDraft[]): Promise<PassengerDraft[]>;
  deletePassenger(passengerId: string): Promise<void>;
}
