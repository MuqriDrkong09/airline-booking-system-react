import type { AircraftFormParsedValues } from '../schemas/aircraftFormSchema';
import type { AdminAircraft, AdminAircraftInput } from '../types/adminAircraft';
import { buildDefaultSeatMapConfig } from './seatMapConfig';

export function toAdminAircraftInput(values: AircraftFormParsedValues): AdminAircraftInput {
  const seatFields = {
    manufacturer: values.manufacturer,
    model: values.model,
    economySeats: values.economySeats,
    premiumEconomySeats: values.premiumEconomySeats,
    businessSeats: values.businessSeats,
    firstClassSeats: values.firstClassSeats,
  };

  return {
    ...seatFields,
    registration: values.registration,
    totalSeats: values.totalSeats,
    active: values.active,
    seatMapConfig: buildDefaultSeatMapConfig(seatFields),
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
          cabins: aircraft.seatMapConfig.cabins.map((cabin) => ({
            ...cabin,
            columns: [...cabin.columns],
          })),
        }
      : null,
  };
}
