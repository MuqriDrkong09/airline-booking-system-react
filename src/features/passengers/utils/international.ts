import { MOCK_AIRPORTS } from '@/features/flights';

/**
 * International when origin and destination airports are in different countries.
 * Unknown codes are treated as international so passport rules stay conservative.
 */
export function isInternationalFlight(fromCode: string, toCode: string): boolean {
  const from = fromCode.trim().toUpperCase();
  const to = toCode.trim().toUpperCase();
  if (!from || !to || from === to) {
    return false;
  }

  const origin = MOCK_AIRPORTS.find((airport) => airport.code === from);
  const destination = MOCK_AIRPORTS.find((airport) => airport.code === to);

  if (!origin || !destination) {
    return true;
  }

  return origin.country !== destination.country;
}
