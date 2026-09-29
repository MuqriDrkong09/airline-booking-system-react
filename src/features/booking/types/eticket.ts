/**
 * Structured e-ticket DTO — one boarding pass per passenger.
 * Keep JSON-serializable for a future PDF/boarding-pass API.
 */
export interface BookingETicketBoardingInfo {
  /** Suggested boarding open time (local ISO-ish). */
  boardingTime: string;
  /** Gate when known; otherwise a check-screens message. */
  gate: string;
  /** Departure terminal when known. */
  terminal: string;
  /** Short passenger-facing boarding notes. */
  instructions: string;
}

export interface BookingETicket {
  bookingReference: string;
  passengerName: string;
  passengerId: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  originCode: string;
  originCity: string;
  originAirport: string;
  destinationCode: string;
  destinationCity: string;
  destinationAirport: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  seat: string;
  cabinClass: string;
  boarding: BookingETicketBoardingInfo;
  /**
   * QR payload — booking identifier only (no passenger PII).
   * Example: `AEROBOOK:AB-XXXXXXXX`
   */
  qrPayload: string;
}
