import { SEAT_CLASS_BASE_PRICE } from '@/features/seats/constants/seat';
import {
  BUSINESS_LAYOUT,
  ECONOMY_LAYOUT,
  FIRST_LAYOUT,
  PREMIUM_ECONOMY_LAYOUT,
} from '@/features/seats/constants/seat';
import { DEFAULT_COLUMN_LAYOUT } from '../constants/seatTypes';
import { aircraftSeatMapConfigSchema } from '../schemas/seatMapConfigSchema';
import type {
  AdminAircraft,
  AdminSeatType,
  AircraftCabinClass,
  AircraftConfiguredSeat,
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

export function columnsWithoutAisle(columns: readonly string[]): string[] {
  return columns.filter((column) => column !== '|').map((column) => column.toUpperCase());
}

export function parseColumnLayout(input: string): string[] {
  const tokens = input
    .toUpperCase()
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .flatMap((token) => {
      if (token === '|') {
        return ['|'];
      }
      if (token.includes('|')) {
        return token.split('|').flatMap((part, index, parts) => {
          const letters = part.split('').filter(Boolean);
          return index < parts.length - 1 ? [...letters, '|'] : letters;
        });
      }
      if (/^[A-Z]+$/.test(token)) {
        return token.split('');
      }
      return [token];
    });

  return tokens.length > 0 ? tokens : [...DEFAULT_COLUMN_LAYOUT];
}

export function formatColumnLayout(columns: readonly string[]): string {
  return columns.join(' ');
}

export function createConfiguredSeat(params: {
  row: number;
  column: string;
  cabinClass: AircraftCabinClass;
  seatType?: AdminSeatType;
  price?: number;
  emergencyExit?: boolean;
  disabled?: boolean;
  label?: string;
}): AircraftConfiguredSeat {
  const column = params.column.toUpperCase();
  const label = (params.label ?? `${params.row}${column}`).toUpperCase();
  const seatType = params.seatType ?? 'STANDARD';
  const emergencyExit = params.emergencyExit ?? seatType === 'EMERGENCY_EXIT';
  const disabled = params.disabled ?? seatType === 'UNAVAILABLE';

  return {
    id: `seat-${params.row}-${column}`,
    row: params.row,
    column,
    label,
    cabinClass: params.cabinClass,
    seatType,
    price: params.price ?? SEAT_CLASS_BASE_PRICE[params.cabinClass],
    emergencyExit,
    disabled,
  };
}

export function buildSeatsFromCabins(
  cabins: readonly AircraftSeatMapCabinSection[],
): AircraftConfiguredSeat[] {
  const seats: AircraftConfiguredSeat[] = [];

  for (const cabin of cabins) {
    const letterColumns = columnsWithoutAisle(cabin.columns);
    for (let offset = 0; offset < cabin.rowCount; offset += 1) {
      const row = cabin.startRow + offset;
      for (const column of letterColumns) {
        seats.push(
          createConfiguredSeat({
            row,
            column,
            cabinClass: cabin.cabinClass,
          }),
        );
      }
    }
  }

  return seats;
}

export function deriveCabinsFromSeats(
  seats: readonly AircraftConfiguredSeat[],
  columns: readonly string[],
): AircraftSeatMapCabinSection[] {
  if (seats.length === 0) {
    return [];
  }

  const classByRow = new Map<number, AircraftCabinClass>();
  const countByRow = new Map<number, number>();

  for (const seat of seats) {
    classByRow.set(seat.row, seat.cabinClass);
    countByRow.set(seat.row, (countByRow.get(seat.row) ?? 0) + 1);
  }

  const rowNumbers = [...classByRow.keys()].sort((left, right) => left - right);
  const cabins: AircraftSeatMapCabinSection[] = [];

  for (const row of rowNumbers) {
    const cabinClass = classByRow.get(row)!;
    const seatCount = countByRow.get(row) ?? 0;
    const last = cabins[cabins.length - 1];

    if (last && last.cabinClass === cabinClass && last.startRow + last.rowCount === row) {
      last.rowCount += 1;
      last.seatCount += seatCount;
      continue;
    }

    cabins.push({
      cabinClass,
      seatCount,
      columns: [...columns],
      startRow: row,
      rowCount: 1,
    });
  }

  return cabins;
}

export function buildSeatsFromLayout(params: {
  rows: number;
  columns: readonly string[];
  cabinClass?: AircraftCabinClass;
  previousSeats?: readonly AircraftConfiguredSeat[];
}): AircraftConfiguredSeat[] {
  const letterColumns = columnsWithoutAisle(params.columns);
  const cabinClass = params.cabinClass ?? 'ECONOMY';
  const previousByPosition = new Map(
    (params.previousSeats ?? []).map((seat) => [`${seat.row}:${seat.column}`, seat] as const),
  );

  const seats: AircraftConfiguredSeat[] = [];
  for (let row = 1; row <= params.rows; row += 1) {
    for (const column of letterColumns) {
      const previous = previousByPosition.get(`${row}:${column}`);
      if (previous) {
        seats.push({
          ...previous,
          id: `seat-${row}-${column}`,
          row,
          column,
          label: previous.label || `${row}${column}`,
        });
        continue;
      }
      seats.push(createConfiguredSeat({ row, column, cabinClass }));
    }
  }
  return seats;
}

/**
 * Builds a default seat-map configuration from cabin seat counts,
 * including interactive seat cells for the editor.
 */
export function buildDefaultSeatMapConfig(aircraft: SeatCountFields): AircraftSeatMapConfig {
  const cabins: AircraftSeatMapCabinSection[] = [];
  let nextStartRow = 1;
  let columns: string[] = [...DEFAULT_COLUMN_LAYOUT];

  for (const cabinClass of CABIN_ORDER) {
    const seatCount = seatCountForClass(aircraft, cabinClass);
    if (seatCount <= 0) {
      continue;
    }

    const cabinColumns = [...CABIN_COLUMN_LAYOUTS[cabinClass]];
    columns = cabinColumns;
    const seatsPerRow = Math.max(columnsWithoutAisle(cabinColumns).length, 1);
    const rowCount = Math.max(1, Math.ceil(seatCount / seatsPerRow));

    cabins.push({
      cabinClass,
      seatCount,
      columns: cabinColumns,
      startRow: nextStartRow,
      rowCount,
    });
    nextStartRow += rowCount;
  }

  if (cabins.length === 0) {
    cabins.push({
      cabinClass: 'ECONOMY',
      seatCount: 0,
      columns: [...DEFAULT_COLUMN_LAYOUT],
      startRow: 1,
      rowCount: 1,
    });
  }

  const seats = buildSeatsFromCabins(cabins);
  const rows = Math.max(...seats.map((seat) => seat.row), 1);

  return {
    layoutKey: `${aircraft.manufacturer} ${aircraft.model}`.trim(),
    rows,
    columns,
    cabins,
    seats,
    notes: 'Auto-generated from cabin seat counts. Editable in the seat-map editor.',
    version: 1,
  };
}

/** Ensures legacy configs without `seats`/`rows`/`columns` are hydrated for the editor. */
export function ensureSeatMapConfig(
  config: AircraftSeatMapConfig | null | undefined,
  aircraft: SeatCountFields,
): AircraftSeatMapConfig {
  if (!config) {
    return buildDefaultSeatMapConfig(aircraft);
  }

  const columns =
    config.columns?.length > 0
      ? config.columns.map((token) => (token === '|' ? '|' : token.toUpperCase()))
      : config.cabins[0]?.columns?.length
        ? [...config.cabins[0].columns]
        : [...DEFAULT_COLUMN_LAYOUT];

  const seats =
    config.seats?.length > 0
      ? config.seats.map((seat) => ({
          ...seat,
          column: seat.column.toUpperCase(),
          label: seat.label.toUpperCase(),
        }))
      : buildSeatsFromCabins(config.cabins);

  const rows = config.rows > 0 ? config.rows : Math.max(...seats.map((seat) => seat.row), 1);
  const cabins =
    config.cabins.length > 0 ? config.cabins : deriveCabinsFromSeats(seats, columns);

  return {
    ...config,
    rows,
    columns,
    cabins,
    seats,
  };
}

export function syncSeatMapConfig(config: AircraftSeatMapConfig): AircraftSeatMapConfig {
  const columns = config.columns.map((token) => (token === '|' ? '|' : token.toUpperCase()));
  const seats = [...config.seats]
    .map((seat) => ({
      ...seat,
      column: seat.column.toUpperCase(),
      label: seat.label.toUpperCase(),
      emergencyExit: seat.seatType === 'EMERGENCY_EXIT' ? true : seat.emergencyExit,
      disabled: seat.seatType === 'UNAVAILABLE' ? true : seat.disabled,
    }))
    .sort((left, right) => left.row - right.row || left.column.localeCompare(right.column));

  const rows = Math.max(config.rows, ...seats.map((seat) => seat.row), 1);

  return {
    ...config,
    rows,
    columns,
    seats,
    cabins: deriveCabinsFromSeats(seats, columns),
  };
}

export function applySeatType(
  seat: AircraftConfiguredSeat,
  seatType: AdminSeatType,
): AircraftConfiguredSeat {
  return {
    ...seat,
    seatType,
    emergencyExit: seatType === 'EMERGENCY_EXIT' ? true : seatType === 'STANDARD' ? false : seat.emergencyExit,
    disabled: seatType === 'UNAVAILABLE' ? true : seatType === 'STANDARD' ? false : seat.disabled,
  };
}

export function validateSeatMapConfig(config: AircraftSeatMapConfig): AircraftSeatMapConfig {
  return aircraftSeatMapConfigSchema.parse(syncSeatMapConfig(config));
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
