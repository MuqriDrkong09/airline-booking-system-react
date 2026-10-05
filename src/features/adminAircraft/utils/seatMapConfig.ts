import {
  BUSINESS_LAYOUT,
  ECONOMY_LAYOUT,
  FIRST_LAYOUT,
  PREMIUM_ECONOMY_LAYOUT,
} from '@/features/seats/constants/seat';
import type {
  AdminAircraft,
  AircraftCabinClass,
  AircraftSeatMapCabinSection,
  AircraftSeatMapConfig,
} from '../types/adminAircraft';

type SeatCountFields = Pick<
  AdminAircraft,
  | 'manufacturer'
  | 'model'
  | 'economySeats'
  | 'premiumEconomySeats'
  | 'businessSeats'
  | 'firstClassSeats'
>;

const CABIN_COLUMN_LAYOUTS: Readonly<Record<AircraftCabinClass, readonly string[]>> = {
  FIRST: FIRST_LAYOUT,
  BUSINESS: BUSINESS_LAYOUT,
  PREMIUM_ECONOMY: PREMIUM_ECONOMY_LAYOUT,
  ECONOMY: ECONOMY_LAYOUT,
};

/** Cabin order from nose to tail for generated seat-map configs. */
const CABIN_ORDER: readonly AircraftCabinClass[] = [
  'FIRST',
  'BUSINESS',
  'PREMIUM_ECONOMY',
  'ECONOMY',
];

function seatCountForClass(aircraft: SeatCountFields, cabinClass: AircraftCabinClass): number {
  switch (cabinClass) {
    case 'FIRST':
      return aircraft.firstClassSeats;
    case 'BUSINESS':
      return aircraft.businessSeats;
    case 'PREMIUM_ECONOMY':
      return aircraft.premiumEconomySeats;
    case 'ECONOMY':
      return aircraft.economySeats;
    default:
      return 0;
  }
}

function columnsWithoutAisle(columns: readonly string[]): string[] {
  return columns.filter((column) => column !== '|');
}

/**
 * Builds a default seat-map configuration from cabin seat counts.
 * Row counts are derived from seats ÷ columns-per-row (ceiling).
 */
export function buildDefaultSeatMapConfig(aircraft: SeatCountFields): AircraftSeatMapConfig {
  const cabins: AircraftSeatMapCabinSection[] = [];
  let nextStartRow = 1;

  for (const cabinClass of CABIN_ORDER) {
    const seatCount = seatCountForClass(aircraft, cabinClass);
    if (seatCount <= 0) {
      continue;
    }

    const columns = [...CABIN_COLUMN_LAYOUTS[cabinClass]];
    const seatsPerRow = Math.max(columnsWithoutAisle(columns).length, 1);
    const rowCount = Math.max(1, Math.ceil(seatCount / seatsPerRow));

    cabins.push({
      cabinClass,
      seatCount,
      columns,
      startRow: nextStartRow,
      rowCount,
    });
    nextStartRow += rowCount;
  }

  return {
    layoutKey: `${aircraft.manufacturer} ${aircraft.model}`.trim(),
    cabins,
    notes: 'Auto-generated from cabin seat counts. Ready for seat-map editor.',
    version: 1,
  };
}

export function sumCabinSeats(
  aircraft: Pick<
    AdminAircraft,
    'economySeats' | 'premiumEconomySeats' | 'businessSeats' | 'firstClassSeats'
  >,
): number {
  return (
    aircraft.economySeats +
    aircraft.premiumEconomySeats +
    aircraft.businessSeats +
    aircraft.firstClassSeats
  );
}
