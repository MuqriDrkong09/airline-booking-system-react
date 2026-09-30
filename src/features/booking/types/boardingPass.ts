/**
 * Structured digital boarding pass DTO — one pass per checked-in passenger.
 * Keep JSON-serializable for a future PDF / wallet API.
 */
export interface BoardingPass {
  bookingReference: string;
  passengerId: string;
  passengerName: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  /** Departure calendar date `YYYY-MM-DD`. */
  date: string;
  /** Local departure clock time `HH:mm`. */
  departureTime: string;
  /** Local boarding open clock time `HH:mm`. */
  boardingTime: string;
  gate: string;
  terminal: string;
  seat: string;
  boardingGroup: string;
  cabinClass: string;
  /**
   * QR / barcode payload — booking + passenger sequence only (no PII).
   * Example: `AEROBOOK-BP:AB-XXXXXXXX:01`
   */
  scanPayload: string;
}
