import type { FlightOffer, FlightSearchRequest, FlightSearchResponse } from '../types/flight';

export interface FlightsApi {
  searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse>;
  getFlightById(
    flightId: string,
    context?: Partial<FlightSearchRequest> | null,
  ): Promise<FlightOffer | null>;
}
