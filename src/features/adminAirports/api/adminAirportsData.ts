import { MOCK_AIRPORTS } from '@/features/flights';
import type { AdminAirport } from '../types/adminAirport';
import { cloneAdminAirport } from '../utils/formatAdminAirport';

export function createSeedAdminAirports(): AdminAirport[] {
  return MOCK_AIRPORTS.map(cloneAdminAirport);
}
