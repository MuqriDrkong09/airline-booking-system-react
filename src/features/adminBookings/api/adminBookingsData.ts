import type { Booking, BookingPassenger, BookingRecordStatus } from '@/features/booking';
import { MOCK_AIRLINES, MOCK_AIRPORTS } from '@/features/flights';
import type { FlightOffer } from '@/features/flights';
import { addDaysIso, todayIsoDate } from '@/features/flights/utils/dates';

function airport(code: string) {
  const found = MOCK_AIRPORTS.find((item) => item.code === code);
  if (!found) {
    throw new Error(`Missing mock airport ${code}`);
  }
  return found;
}

function airline(code: string) {
  const found = MOCK_AIRLINES.find((item) => item.code === code);
  if (!found) {
    throw new Error(`Missing mock airline ${code}`);
  }
  return found;
}

function endpoint(code: string, terminal: string) {
  const item = airport(code);
  return {
    code: item.code,
    city: item.city,
    airportName: item.name,
    terminal,
  };
}

function buildOffer(params: {
  id: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  price: number;
  refundable: boolean;
  cabinClass?: FlightOffer['cabinClass'];
}): FlightOffer {
  const carrier = airline(params.airlineCode);
  const cabinClass = params.cabinClass ?? 'ECONOMY';
  const origin = endpoint(params.origin, '1');
  const destination = endpoint(params.destination, '1');
  const aircraft = { model: 'A320', registration: '9M-AAA' };

  return {
    id: params.id,
    airline: carrier,
    flightNumber: params.flightNumber,
    aircraft,
    origin,
    destination,
    departureTime: params.departureTime,
    arrivalTime: params.arrivalTime,
    durationMinutes: params.durationMinutes,
    stops: 0,
    stopAirports: [],
    cabinClass,
    baggage: {
      cabinKg: 7,
      checkedKg: 20,
      pieces: 1,
      allowanceSummary: '1 checked piece up to 20kg · 7kg cabin bag',
    },
    amenities: {
      meals: 'Complimentary light meal',
      wifi: true,
      wifiNotes: 'Available for purchase',
      seatInformation: '32-inch pitch',
    },
    policies: {
      changePolicy: params.refundable
        ? 'Changes allowed with a fee before departure.'
        : 'Changes are restricted on this fare.',
      refundPolicy: params.refundable
        ? 'Refundable fare with a cancellation fee.'
        : 'Non-refundable fare.',
      fareConditions: ['Standard fare rules apply.', 'No-show forfeits the fare.'],
    },
    segments: [
      {
        id: `${params.id}-seg-1`,
        flightNumber: params.flightNumber,
        airline: carrier,
        aircraft,
        origin,
        destination,
        departureTime: params.departureTime,
        arrivalTime: params.arrivalTime,
        durationMinutes: params.durationMinutes,
      },
    ],
    price: { amount: params.price, currency: 'USD' },
    availableSeats: 40,
    refundable: params.refundable,
    baggageIncluded: true,
  };
}

function passenger(params: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): BookingPassenger {
  return {
    id: params.id,
    type: 'ADULT',
    title: 'Mr',
    firstName: params.firstName,
    lastName: params.lastName,
    dateOfBirth: '1990-01-15',
    gender: 'MALE',
    nationality: 'MY',
    passportNumber: 'A1234567',
    passportExpiry: '2030-01-01',
    email: params.email,
    phone: params.phone,
    associatedAdultId: '',
  };
}

function booking(params: {
  id: string;
  reference: string;
  status: BookingRecordStatus;
  createdAt: string;
  flight: FlightOffer;
  passengers: BookingPassenger[];
  total: number;
  cancellation?: Booking['cancellation'];
}): Booking {
  return {
    id: params.id,
    reference: params.reference,
    status: params.status,
    createdAt: params.createdAt,
    updatedAt: params.createdAt,
    flightId: params.flight.id,
    cabinClass: params.flight.cabinClass,
    flight: params.flight,
    searchCriteria: null,
    passengers: params.passengers,
    seats: [],
    baggage: [],
    meals: [],
    addons: [],
    promoCode: null,
    payment: {
      method: 'CARD',
      billingName: `${params.passengers[0]?.firstName ?? ''} ${params.passengers[0]?.lastName ?? ''}`.trim(),
      billingEmail: params.passengers[0]?.email ?? '',
      cardBrand: 'Visa',
      cardLast4: '4242',
    },
    priceBreakdown: {
      currency: 'USD',
      baseFare: params.total * 0.8,
      seatCost: 0,
      baggageCost: 0,
      mealCost: 0,
      addonCost: 0,
      subtotal: params.total * 0.9,
      taxes: params.total * 0.1,
      discount: 0,
      finalTotal: params.total,
    },
    transactionId: `txn-${params.id}`,
    checkedInPassengerIds: params.status === 'CHECKED_IN' ? [params.passengers[0]!.id] : [],
    cancellation: params.cancellation,
  };
}

export function createSeedAdminBookings(): Booking[] {
  const today = todayIsoDate();
  const day14 = addDaysIso(today, 14);
  const day15 = addDaysIso(today, 15);
  const day21 = addDaysIso(today, 21);
  const dayMinus40 = addDaysIso(today, -40);
  const dayMinus20 = addDaysIso(today, -20);

  const mh1 = buildOffer({
    id: 'flt-admin-mh1',
    airlineCode: 'MH',
    flightNumber: 'MH1',
    origin: 'KUL',
    destination: 'NRT',
    departureTime: `${day14}T09:15`,
    arrivalTime: `${day14}T17:05`,
    durationMinutes: 410,
    price: 820,
    refundable: true,
    cabinClass: 'BUSINESS',
  });

  const sq118 = buildOffer({
    id: 'flt-admin-sq118',
    airlineCode: 'SQ',
    flightNumber: 'SQ118',
    origin: 'SIN',
    destination: 'KUL',
    departureTime: `${day14}T11:40`,
    arrivalTime: `${day14}T12:45`,
    durationMinutes: 65,
    price: 180,
    refundable: false,
  });

  const ak512 = buildOffer({
    id: 'flt-admin-ak512',
    airlineCode: 'AK',
    flightNumber: 'AK512',
    origin: 'KUL',
    destination: 'BKK',
    departureTime: `${day15}T07:05`,
    arrivalTime: `${day15}T08:10`,
    durationMinutes: 65,
    price: 95,
    refundable: true,
  });

  const cx720 = buildOffer({
    id: 'flt-admin-cx720',
    airlineCode: 'CX',
    flightNumber: 'CX720',
    origin: 'HKG',
    destination: 'SIN',
    departureTime: `${dayMinus40}T14:20`,
    arrivalTime: `${dayMinus40}T18:05`,
    durationMinutes: 225,
    price: 420,
    refundable: true,
  });

  const tg408 = buildOffer({
    id: 'flt-admin-tg408',
    airlineCode: 'TG',
    flightNumber: 'TG408',
    origin: 'BKK',
    destination: 'KUL',
    departureTime: `${day21}T16:30`,
    arrivalTime: `${day21}T19:40`,
    durationMinutes: 130,
    price: 210,
    refundable: true,
  });

  return [
    booking({
      id: 'adm-booking-1',
      reference: 'AB-ADMIN001',
      status: 'CONFIRMED',
      createdAt: `${addDaysIso(today, -4)}T08:00:00.000Z`,
      flight: mh1,
      passengers: [
        passenger({
          id: 'pax-1',
          firstName: 'Aisha',
          lastName: 'Rahman',
          email: 'aisha@example.com',
          phone: '+60123456789',
        }),
      ],
      total: 980,
    }),
    booking({
      id: 'adm-booking-2',
      reference: 'AB-ADMIN002',
      status: 'PENDING',
      createdAt: `${addDaysIso(today, -3)}T10:15:00.000Z`,
      flight: sq118,
      passengers: [
        passenger({
          id: 'pax-2',
          firstName: 'Ben',
          lastName: 'Tan',
          email: 'ben.tan@example.com',
          phone: '+6591234567',
        }),
      ],
      total: 210,
    }),
    booking({
      id: 'adm-booking-3',
      reference: 'AB-ADMIN003',
      status: 'CHECKED_IN',
      createdAt: `${addDaysIso(today, -7)}T12:00:00.000Z`,
      flight: ak512,
      passengers: [
        passenger({
          id: 'pax-3',
          firstName: 'Chloe',
          lastName: 'Ng',
          email: 'chloe.ng@example.com',
          phone: '+60198765432',
        }),
      ],
      total: 140,
    }),
    booking({
      id: 'adm-booking-4',
      reference: 'AB-ADMIN004',
      status: 'CANCELLED',
      createdAt: `${addDaysIso(today, -25)}T09:30:00.000Z`,
      flight: { ...cx720, refundable: true },
      passengers: [
        passenger({
          id: 'pax-4',
          firstName: 'Daniel',
          lastName: 'Lee',
          email: 'daniel.lee@example.com',
          phone: '+85251234567',
        }),
      ],
      total: 420,
      cancellation: {
        requestedAt: `${addDaysIso(today, -24)}T11:00:00.000Z`,
        processedAt: `${addDaysIso(today, -24)}T11:00:00.000Z`,
        fee: 80,
        refundAmount: 0,
        currency: 'USD',
        policySummary: 'Cancelled without refund; eligible for admin refund review.',
        finalStatus: 'CANCELLED',
      },
    }),
    booking({
      id: 'adm-booking-5',
      reference: 'AB-ADMIN005',
      status: 'REFUNDED',
      createdAt: `${addDaysIso(today, -30)}T14:20:00.000Z`,
      flight: tg408,
      passengers: [
        passenger({
          id: 'pax-5',
          firstName: 'Elena',
          lastName: 'Soto',
          email: 'elena.soto@example.com',
          phone: '+34600111222',
        }),
      ],
      total: 260,
      cancellation: {
        requestedAt: `${addDaysIso(today, -28)}T08:00:00.000Z`,
        processedAt: `${addDaysIso(today, -28)}T08:05:00.000Z`,
        fee: 40,
        refundAmount: 220,
        currency: 'USD',
        policySummary: 'Refundable fare cancelled with fee.',
        finalStatus: 'REFUNDED',
      },
    }),
    booking({
      id: 'adm-booking-6',
      reference: 'AB-ADMIN006',
      status: 'CONFIRMED',
      createdAt: `${addDaysIso(today, -2)}T16:45:00.000Z`,
      flight: tg408,
      passengers: [
        passenger({
          id: 'pax-6',
          firstName: 'Farid',
          lastName: 'Hassan',
          email: 'farid.hassan@example.com',
          phone: '+60112233445',
        }),
        passenger({
          id: 'pax-7',
          firstName: 'Gita',
          lastName: 'Hassan',
          email: 'gita.hassan@example.com',
          phone: '+60112233446',
        }),
      ],
      total: 420,
    }),
    booking({
      id: 'adm-booking-7',
      reference: 'AB-ADMIN007',
      status: 'COMPLETED',
      createdAt: `${addDaysIso(today, -60)}T07:00:00.000Z`,
      flight: {
        ...cx720,
        departureTime: `${dayMinus20}T14:20`,
        arrivalTime: `${dayMinus20}T18:05`,
      },
      passengers: [
        passenger({
          id: 'pax-8',
          firstName: 'Hana',
          lastName: 'Ibrahim',
          email: 'hana.ibrahim@example.com',
          phone: '+60135556677',
        }),
      ],
      total: 390,
    }),
  ];
}
