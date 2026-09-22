import type { AddonPassengerType } from '../constants/addons';

export interface AddonPassenger {
  id: string;
  type: AddonPassengerType;
  displayName: string;
}

/** One selected add-on assigned to a specific passenger. */
export interface AddonSelection {
  addonId: string;
  passengerId: string;
}
