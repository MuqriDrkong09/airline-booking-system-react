import type { FlightSearchRequest, FlightSearchResponse } from '../types/flight';

export interface FlightsApi {
  searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse>;
}
