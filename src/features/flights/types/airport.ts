export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  terminalCount: number;
  latitude: number;
  longitude: number;
  active: boolean;
}

export interface AirportSearchParams {
  query?: string;
  activeOnly?: boolean;
  limit?: number;
}
