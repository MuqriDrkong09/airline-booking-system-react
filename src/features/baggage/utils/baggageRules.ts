import type { CabinClass } from '@/features/flights';
import {
  BAGGAGE_WEIGHT_PRICE_USD,
  BAGGAGE_WEIGHTS_KG,
  CABIN_BAGGAGE_ALLOWANCE,
  type BaggageAllowance,
  type BaggageWeightKg,
} from '../constants/baggage';
import type {
  BaggageLinePrice,
  BaggagePassenger,
  PassengerBaggageSelection,
} from '../types/baggage';

export function getAllowanceForCabin(cabinClass: CabinClass): BaggageAllowance {
  return CABIN_BAGGAGE_ALLOWANCE[cabinClass];
}

export function isBaggageWeight(value: number): value is BaggageWeightKg {
  return (BAGGAGE_WEIGHTS_KG as readonly number[]).includes(value);
}

export function defaultSelection(passengerId: string): PassengerBaggageSelection {
  return {
    passengerId,
    cabinKg: 7,
    checkedKg: 0,
    additionalKg: 0,
  };
}

function chargeForWeight(selectedKg: number, includedKg: number): number {
  if (selectedKg <= 0 || selectedKg <= includedKg) {
    return 0;
  }
  if (!isBaggageWeight(selectedKg)) {
    return 0;
  }
  return BAGGAGE_WEIGHT_PRICE_USD[selectedKg];
}

export function pricePassengerBaggage(
  selection: PassengerBaggageSelection,
  allowance: BaggageAllowance,
  passengerType: BaggagePassenger['type'],
): BaggageLinePrice {
  if (passengerType === 'INFANT') {
    return {
      passengerId: selection.passengerId,
      cabin: 0,
      checked: 0,
      additional: 0,
      total: 0,
    };
  }

  const cabin = chargeForWeight(selection.cabinKg, allowance.cabinKg);
  const checked = chargeForWeight(selection.checkedKg, allowance.checkedKg);
  const additional =
    selection.additionalKg > 0 && isBaggageWeight(selection.additionalKg)
      ? BAGGAGE_WEIGHT_PRICE_USD[selection.additionalKg]
      : 0;

  return {
    passengerId: selection.passengerId,
    cabin,
    checked,
    additional,
    total: cabin + checked + additional,
  };
}

export function calculateBaggageTotal(
  selections: PassengerBaggageSelection[],
  passengers: BaggagePassenger[],
  allowance: BaggageAllowance,
): number {
  const typeById = new Map(passengers.map((passenger) => [passenger.id, passenger.type]));
  return selections.reduce((sum, selection) => {
    const type = typeById.get(selection.passengerId) ?? 'ADULT';
    return sum + pricePassengerBaggage(selection, allowance, type).total;
  }, 0);
}

export type BaggageValidationResult = { ok: true } | { ok: false; message: string };

export function validateBaggageSelection(options: {
  selections: PassengerBaggageSelection[];
  passengers: BaggagePassenger[];
}): BaggageValidationResult {
  const { selections, passengers } = options;
  const byId = new Map(selections.map((selection) => [selection.passengerId, selection]));

  for (const passenger of passengers) {
    const selection = byId.get(passenger.id);
    if (!selection) {
      return { ok: false, message: `Choose baggage for ${passenger.displayName}.` };
    }

    if (!isBaggageWeight(selection.cabinKg)) {
      return {
        ok: false,
        message: `Choose a cabin bag for ${passenger.displayName}.`,
      };
    }

    if (selection.checkedKg !== 0 && !isBaggageWeight(selection.checkedKg)) {
      return { ok: false, message: `Invalid checked bag for ${passenger.displayName}.` };
    }

    if (selection.additionalKg !== 0 && !isBaggageWeight(selection.additionalKg)) {
      return { ok: false, message: `Invalid additional bag for ${passenger.displayName}.` };
    }

    if (passenger.type === 'INFANT') {
      if (selection.cabinKg !== 7 || selection.checkedKg !== 0 || selection.additionalKg !== 0) {
        return {
          ok: false,
          message: `${passenger.displayName} may only travel with a 7KG cabin bag.`,
        };
      }
      continue;
    }

    if (selection.additionalKg > 0 && selection.checkedKg === 0) {
      return {
        ok: false,
        message: `Add checked baggage before an extra bag for ${passenger.displayName}.`,
      };
    }
  }

  return { ok: true };
}
