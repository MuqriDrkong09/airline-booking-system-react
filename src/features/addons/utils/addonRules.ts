import { ADDON_CATALOG, type Addon } from '../constants/addons';
import type { AddonPassenger, AddonSelection } from '../types/addon';

export function getAddonById(
  addonId: string,
  catalog: readonly Addon[] = ADDON_CATALOG,
): Addon | undefined {
  return catalog.find((addon) => addon.id === addonId);
}

export function isAddonApplicable(addon: Addon, passenger: AddonPassenger): boolean {
  return addon.availability && addon.passengerApplicability.includes(passenger.type);
}

export function addonsForPassenger(
  passenger: AddonPassenger,
  catalog: readonly Addon[] = ADDON_CATALOG,
): Addon[] {
  return catalog.filter((addon) => isAddonApplicable(addon, passenger));
}

export function hasAddonSelection(
  selections: AddonSelection[],
  addonId: string,
  passengerId: string,
): boolean {
  return selections.some(
    (selection) => selection.addonId === addonId && selection.passengerId === passengerId,
  );
}

export function selectAddon(
  selections: AddonSelection[],
  addonId: string,
  passengerId: string,
): AddonSelection[] {
  if (hasAddonSelection(selections, addonId, passengerId)) {
    return selections;
  }
  return [...selections, { addonId, passengerId }];
}

export function removeAddon(
  selections: AddonSelection[],
  addonId: string,
  passengerId: string,
): AddonSelection[] {
  return selections.filter(
    (selection) =>
      !(selection.addonId === addonId && selection.passengerId === passengerId),
  );
}

export function toggleAddon(
  selections: AddonSelection[],
  addonId: string,
  passengerId: string,
): AddonSelection[] {
  if (hasAddonSelection(selections, addonId, passengerId)) {
    return removeAddon(selections, addonId, passengerId);
  }
  return selectAddon(selections, addonId, passengerId);
}

export function calculateAddonTotal(
  selections: AddonSelection[],
  catalog: readonly Addon[] = ADDON_CATALOG,
): number {
  return selections.reduce((sum, selection) => {
    const addon = getAddonById(selection.addonId, catalog);
    return sum + (addon?.price ?? 0);
  }, 0);
}

export function calculateBookingTotal(parts: {
  baggageTotal?: number;
  mealTotal?: number;
  addonTotal?: number;
  seatTotal?: number;
}): number {
  return (
    (parts.baggageTotal ?? 0) +
    (parts.mealTotal ?? 0) +
    (parts.addonTotal ?? 0) +
    (parts.seatTotal ?? 0)
  );
}

export type AddonValidationResult = { ok: true } | { ok: false; message: string };

export function validateAddonSelections(options: {
  selections: AddonSelection[];
  passengers: AddonPassenger[];
  catalog?: readonly Addon[];
}): AddonValidationResult {
  const { selections, passengers, catalog = ADDON_CATALOG } = options;
  const passengerById = new Map(passengers.map((passenger) => [passenger.id, passenger]));

  for (const selection of selections) {
    const passenger = passengerById.get(selection.passengerId);
    if (!passenger) {
      return { ok: false, message: 'An add-on is assigned to an unknown passenger.' };
    }

    const addon = getAddonById(selection.addonId, catalog);
    if (!addon) {
      return { ok: false, message: `Unknown add-on: ${selection.addonId}.` };
    }

    if (!addon.availability) {
      return { ok: false, message: `${addon.name} is unavailable.` };
    }

    if (!isAddonApplicable(addon, passenger)) {
      return {
        ok: false,
        message: `${addon.name} cannot be assigned to ${passenger.displayName}.`,
      };
    }
  }

  return { ok: true };
}
