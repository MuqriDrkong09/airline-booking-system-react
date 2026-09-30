import type {
  FlightStatusLookupRequest,
  FlightStatusRecord,
} from '../types/flightStatus';

export interface FlightStatusApi {
  lookupFlightStatus(
    request: FlightStatusLookupRequest,
  ): Promise<FlightStatusRecord | null>;
}
