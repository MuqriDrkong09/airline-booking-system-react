import type { AdminFlight, AdminFlightFilters } from '../types/adminFlight';

export function filterAdminFlights(
  flights: readonly AdminFlight[],
  filters: AdminFlightFilters,
): AdminFlight[] {
  const search = filters.search.trim().toLowerCase();

  return flights.filter((flight) => {
    if (filters.airline && flight.airline !== filters.airline) {
      return false;
    }
    if (filters.origin && flight.origin !== filters.origin) {
      return false;
    }
    if (filters.destination && flight.destination !== filters.destination) {
      return false;
    }
    if (filters.status && flight.status !== filters.status) {
      return false;
    }
    if (!search) {
      return true;
    }

    const haystack = [
      flight.flightNumber,
      flight.airline,
      flight.origin,
      flight.destination,
      flight.aircraft,
      flight.terminal,
      flight.gate,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });
}
