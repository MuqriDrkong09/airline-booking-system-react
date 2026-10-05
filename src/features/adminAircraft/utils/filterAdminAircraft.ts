import type { AdminAircraft, AdminAircraftFilters } from '../types/adminAircraft';

export function filterAdminAircraft(
  aircraftList: readonly AdminAircraft[],
  filters: AdminAircraftFilters,
): AdminAircraft[] {
  const search = filters.search.trim().toLowerCase();

  return aircraftList.filter((aircraft) => {
    if (filters.manufacturer && aircraft.manufacturer !== filters.manufacturer) {
      return false;
    }
    if (filters.active === 'active' && !aircraft.active) {
      return false;
    }
    if (filters.active === 'inactive' && aircraft.active) {
      return false;
    }
    if (!search) {
      return true;
    }

    const haystack = [
      aircraft.manufacturer,
      aircraft.model,
      aircraft.registration,
      String(aircraft.totalSeats),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function sortAdminAircraft(aircraftList: readonly AdminAircraft[]): AdminAircraft[] {
  return [...aircraftList].sort((left, right) =>
    left.registration.localeCompare(right.registration),
  );
}
