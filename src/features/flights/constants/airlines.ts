import type { FlightAirline } from '../types/flight';

export const MOCK_AIRLINES: readonly FlightAirline[] = [
  {
    code: 'MH',
    name: 'Malaysia Airlines',
    logoUrl: 'https://www.gstatic.com/flights/airline_logos/70px/MH.png',
  },
  {
    code: 'SQ',
    name: 'Singapore Airlines',
    logoUrl: 'https://www.gstatic.com/flights/airline_logos/70px/SQ.png',
  },
  {
    code: 'AK',
    name: 'AirAsia',
    logoUrl: 'https://www.gstatic.com/flights/airline_logos/70px/AK.png',
  },
  {
    code: 'NH',
    name: 'All Nippon Airways',
    logoUrl: 'https://www.gstatic.com/flights/airline_logos/70px/NH.png',
  },
  {
    code: 'JL',
    name: 'Japan Airlines',
    logoUrl: 'https://www.gstatic.com/flights/airline_logos/70px/JL.png',
  },
  {
    code: 'CX',
    name: 'Cathay Pacific',
    logoUrl: 'https://www.gstatic.com/flights/airline_logos/70px/CX.png',
  },
  {
    code: 'TG',
    name: 'Thai Airways',
    logoUrl: 'https://www.gstatic.com/flights/airline_logos/70px/TG.png',
  },
  {
    code: 'KE',
    name: 'Korean Air',
    logoUrl: 'https://www.gstatic.com/flights/airline_logos/70px/KE.png',
  },
] as const;
