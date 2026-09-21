import {
  BUSINESS_LAYOUT,
  ECONOMY_LAYOUT,
  FIRST_LAYOUT,
  PREMIUM_ECONOMY_LAYOUT,
  SEAT_CLASS_BASE_PRICE,
  type SeatFeature,
  type SeatStatus,
} from '../constants/seat';
import type { Seat, SeatClass, SeatMapModel, SeatRowModel } from '../types/seat';

interface RowSpec {
  row: number;
  class: SeatClass;
  layout: readonly string[];
  statusOverrides?: Partial<Record<string, SeatStatus>>;
  featureExtras?: Partial<Record<string, SeatFeature[]>>;
  priceExtras?: Partial<Record<string, number>>;
}

function columnsFromLayout(layout: readonly string[]): string[] {
  return layout.filter((item) => item !== '|');
}

function featuresForColumn(column: string, layout: readonly string[]): SeatFeature[] {
  const columns = columnsFromLayout(layout);
  const features: SeatFeature[] = [];
  if (columns[0] === column || columns[columns.length - 1] === column) {
    features.push('WINDOW');
  }
  const aisleNeighbors = new Set<string>();
  layout.forEach((item, index) => {
    if (item === '|') {
      if (layout[index - 1] && layout[index - 1] !== '|') {
        aisleNeighbors.add(layout[index - 1]!);
      }
      if (layout[index + 1] && layout[index + 1] !== '|') {
        aisleNeighbors.add(layout[index + 1]!);
      }
    }
  });
  if (aisleNeighbors.has(column)) {
    features.push('AISLE');
  }
  return features;
}

function buildSeat(spec: RowSpec, column: string): Seat {
  const label = `${spec.row}${column}`;
  const status = spec.statusOverrides?.[column] ?? 'AVAILABLE';
  const extraFeatures = spec.featureExtras?.[column] ?? [];
  const baseFeatures = featuresForColumn(column, spec.layout);
  const features = Array.from(new Set([...baseFeatures, ...extraFeatures]));

  let price = SEAT_CLASS_BASE_PRICE[spec.class];
  if (status === 'PREMIUM') {
    price += 35;
  }
  if (status === 'EMERGENCY_EXIT') {
    price += 25;
  }
  if (features.includes('EXTRA_LEGROOM') && status !== 'EMERGENCY_EXIT') {
    price += 20;
  }
  price += spec.priceExtras?.[column] ?? 0;

  return {
    id: `${spec.class.toLowerCase()}-${label}`,
    row: spec.row,
    column,
    label,
    class: spec.class,
    price,
    status,
    features,
  };
}

function buildRow(spec: RowSpec): SeatRowModel {
  const seats = columnsFromLayout(spec.layout).map((column) => buildSeat(spec, column));
  return {
    row: spec.row,
    class: spec.class,
    seats,
    layout: [...spec.layout],
  };
}

/**
 * Builds a reusable mock narrow-body seat map covering first, business,
 * premium economy, and economy cabins with mixed seat states.
 */
export function createAircraftSeatMap(
  aircraftModel = 'Airbus A320',
): SeatMapModel {
  const specs: RowSpec[] = [
    {
      row: 1,
      class: 'FIRST',
      layout: FIRST_LAYOUT,
      statusOverrides: { A: 'PREMIUM' },
    },
    {
      row: 2,
      class: 'FIRST',
      layout: FIRST_LAYOUT,
      statusOverrides: { F: 'OCCUPIED' },
    },
    {
      row: 3,
      class: 'BUSINESS',
      layout: BUSINESS_LAYOUT,
      statusOverrides: { A: 'PREMIUM', D: 'OCCUPIED' },
    },
    {
      row: 4,
      class: 'BUSINESS',
      layout: BUSINESS_LAYOUT,
      statusOverrides: { C: 'UNAVAILABLE' },
    },
    {
      row: 5,
      class: 'BUSINESS',
      layout: BUSINESS_LAYOUT,
    },
    {
      row: 6,
      class: 'PREMIUM_ECONOMY',
      layout: PREMIUM_ECONOMY_LAYOUT,
      statusOverrides: { A: 'PREMIUM', F: 'PREMIUM' },
      featureExtras: {
        A: ['EXTRA_LEGROOM'],
        C: ['EXTRA_LEGROOM'],
        D: ['EXTRA_LEGROOM'],
        F: ['EXTRA_LEGROOM'],
      },
    },
    {
      row: 7,
      class: 'PREMIUM_ECONOMY',
      layout: PREMIUM_ECONOMY_LAYOUT,
      statusOverrides: { C: 'OCCUPIED', D: 'OCCUPIED' },
    },
    {
      row: 8,
      class: 'ECONOMY',
      layout: ECONOMY_LAYOUT,
      statusOverrides: {
        A: 'EMERGENCY_EXIT',
        B: 'EMERGENCY_EXIT',
        C: 'EMERGENCY_EXIT',
        D: 'EMERGENCY_EXIT',
        E: 'EMERGENCY_EXIT',
        F: 'EMERGENCY_EXIT',
      },
      featureExtras: {
        A: ['EXTRA_LEGROOM'],
        B: ['EXTRA_LEGROOM'],
        C: ['EXTRA_LEGROOM'],
        D: ['EXTRA_LEGROOM'],
        E: ['EXTRA_LEGROOM'],
        F: ['EXTRA_LEGROOM'],
      },
    },
    {
      row: 9,
      class: 'ECONOMY',
      layout: ECONOMY_LAYOUT,
      statusOverrides: { B: 'OCCUPIED', E: 'UNAVAILABLE' },
    },
    {
      row: 10,
      class: 'ECONOMY',
      layout: ECONOMY_LAYOUT,
      statusOverrides: { A: 'PREMIUM', F: 'PREMIUM' },
    },
    {
      row: 11,
      class: 'ECONOMY',
      layout: ECONOMY_LAYOUT,
      featureExtras: { C: ['NEAR_GALLEY'], D: ['NEAR_LAVATORY'] },
    },
    {
      row: 12,
      class: 'ECONOMY',
      layout: ECONOMY_LAYOUT,
      statusOverrides: { C: 'OCCUPIED', D: 'OCCUPIED' },
    },
    {
      row: 13,
      class: 'ECONOMY',
      layout: ECONOMY_LAYOUT,
    },
    {
      row: 14,
      class: 'ECONOMY',
      layout: ECONOMY_LAYOUT,
      statusOverrides: { B: 'UNAVAILABLE' },
    },
  ];

  const rows = specs.map(buildRow);
  const seats = rows.flatMap((row) => row.seats);

  return {
    aircraftModel,
    rows,
    seats,
  };
}
