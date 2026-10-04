import type { AirportFormParsedValues } from '../schemas/airportFormSchema';
import type { AdminAirport, AdminAirportInput } from '../types/adminAirport';

export function toAdminAirportInput(values: AirportFormParsedValues): AdminAirportInput {
  return {
    code: values.code,
    name: values.name,
    city: values.city,
    country: values.country,
    timezone: values.timezone,
    terminalCount: values.terminals,
    latitude: values.latitude,
    longitude: values.longitude,
    active: values.active,
  };
}

export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

export function getActiveLabel(active: boolean): string {
  return active ? 'Active' : 'Inactive';
}

export function cloneAdminAirport(airport: AdminAirport): AdminAirport {
  return { ...airport };
}
