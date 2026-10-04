import type { AdminAirport, AdminAirportFilters } from '../types/adminAirport';

export function filterAdminAirports(
  airports: readonly AdminAirport[],
  filters: AdminAirportFilters,
): AdminAirport[] {
  const search = filters.search.trim().toLowerCase();

  return airports.filter((airport) => {
    if (filters.country && airport.country !== filters.country) {
      return false;
    }
    if (filters.active === 'active' && !airport.active) {
      return false;
    }
    if (filters.active === 'inactive' && airport.active) {
      return false;
    }
    if (!search) {
      return true;
    }

    const haystack = [airport.code, airport.name, airport.city, airport.country, airport.timezone]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function sortAdminAirports(airports: readonly AdminAirport[]): AdminAirport[] {
  return [...airports].sort((left, right) => left.code.localeCompare(right.code));
}
