import type { AircraftFormParsedValues } from '../schemas/aircraftFormSchema';
import type { AdminAircraft, AdminAircraftInput, AircraftSeatMapConfig } from '../types/adminAircraft';
import { buildDefaultSeatMapConfig, ensureSeatMapConfig } from './seatMapConfig';

function cabinCountsMatch(
  existing: AdminAircraft,
  values: AircraftFormParsedValues,
): boolean {
  return (
    existing.economySeats === values.economySeats &&
    existing.premiumEconomySeats === values.premiumEconomySeats &&
    existing.businessSeats === values.businessSeats &&
    existing.firstClassSeats === values.firstClassSeats &&
    existing.totalSeats === values.totalSeats
  );
}

export function toAdminAircraftInput(
  values: AircraftFormParsedValues,
  existing?: AdminAircraft | null,
): AdminAircraftInput {
  const seatFields = {
    manufacturer: values.manufacturer,
    model: values.model,
    economySeats: values.economySeats,
    premiumEconomySeats: values.premiumEconomySeats,
    businessSeats: values.businessSeats,
    firstClassSeats: values.firstClassSeats,
  };

  let seatMapConfig: AircraftSeatMapConfig;
  if (existing?.seatMapConfig && cabinCountsMatch(existing, values)) {
    seatMapConfig = {
      ...ensureSeatMapConfig(existing.seatMapConfig, seatFields),
      layoutKey: `${values.manufacturer} ${values.model}`.trim(),
    };
  } else {
    seatMapConfig = buildDefaultSeatMapConfig(seatFields);
  }

  return {
    ...seatFields,
    registration: values.registration,
    totalSeats: values.totalSeats,
    active: values.active,
    seatMapConfig,
  };
}

export function formatAircraftLabel(aircraft: Pick<AdminAircraft, 'manufacturer' | 'model'>): string {
  return `${aircraft.manufacturer} ${aircraft.model}`.trim();
}

export function formatSeatBreakdown(
  aircraft: Pick<
    AdminAircraft,
    'economySeats' | 'premiumEconomySeats' | 'businessSeats' | 'firstClassSeats'
  >,
): string {
  return [
    `Y ${aircraft.economySeats}`,
    `W ${aircraft.premiumEconomySeats}`,
    `J ${aircraft.businessSeats}`,
    `F ${aircraft.firstClassSeats}`,
  ].join(' · ');
}

export function getActiveLabel(active: boolean): string {
  return active ? 'Active' : 'Inactive';
}

export function cloneAdminAircraft(aircraft: AdminAircraft): AdminAircraft {
  return {
    ...aircraft,
    seatMapConfig: aircraft.seatMapConfig
      ? {
          ...aircraft.seatMapConfig,
          columns: [...aircraft.seatMapConfig.columns],
          cabins: aircraft.seatMapConfig.cabins.map((cabin) => ({
            ...cabin,
            columns: [...cabin.columns],
          })),
          seats: aircraft.seatMapConfig.seats.map((seat) => ({ ...seat })),
        }
      : null,
  };
}
