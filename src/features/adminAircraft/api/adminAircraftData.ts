import type { AdminAircraft } from '../types/adminAircraft';
import { cloneAdminAircraft } from '../utils/formatAdminAircraft';
import { buildDefaultSeatMapConfig } from '../utils/seatMapConfig';

function withSeatMap(
  aircraft: Omit<AdminAircraft, 'seatMapConfig'>,
): AdminAircraft {
  return {
    ...aircraft,
    seatMapConfig: buildDefaultSeatMapConfig(aircraft),
  };
}

const SEED_AIRCRAFT: readonly Omit<AdminAircraft, 'seatMapConfig'>[] = [
  {
    id: 'aircraft-admin-1',
    manufacturer: 'Airbus',
    model: 'A320',
    registration: '9M-AAA',
    totalSeats: 162,
    economySeats: 150,
    premiumEconomySeats: 0,
    businessSeats: 12,
    firstClassSeats: 0,
    active: true,
  },
  {
    id: 'aircraft-admin-2',
    manufacturer: 'Airbus',
    model: 'A350',
    registration: '9M-AAB',
    totalSeats: 286,
    economySeats: 200,
    premiumEconomySeats: 36,
    businessSeats: 42,
    firstClassSeats: 8,
    active: true,
  },
  {
    id: 'aircraft-admin-3',
    manufacturer: 'Boeing',
    model: '737-800',
    registration: '9M-BAC',
    totalSeats: 162,
    economySeats: 162,
    premiumEconomySeats: 0,
    businessSeats: 0,
    firstClassSeats: 0,
    active: true,
  },
  {
    id: 'aircraft-admin-4',
    manufacturer: 'Boeing',
    model: '777-300ER',
    registration: '9M-BAD',
    totalSeats: 370,
    economySeats: 264,
    premiumEconomySeats: 40,
    businessSeats: 50,
    firstClassSeats: 16,
    active: true,
  },
  {
    id: 'aircraft-admin-5',
    manufacturer: 'Airbus',
    model: 'A321',
    registration: '9M-AAZ',
    totalSeats: 200,
    economySeats: 184,
    premiumEconomySeats: 0,
    businessSeats: 16,
    firstClassSeats: 0,
    active: false,
  },
];

export function createSeedAdminAircraft(): AdminAircraft[] {
  return SEED_AIRCRAFT.map((aircraft) => cloneAdminAircraft(withSeatMap(aircraft)));
}
