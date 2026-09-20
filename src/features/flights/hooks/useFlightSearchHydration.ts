import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { airportKeys, getAirportByCode } from '../api';
import {
  createDefaultFlightSearchValues,
  createEmptyLeg,
} from '../schemas/searchSchema';
import type { Airport, FlightSearchCriteria, FlightSearchFormValues } from '../types';
import { addDaysIso, todayIsoDate } from '../utils/dates';
import { parseFlightSearchParams } from '../utils/searchParams';

function uniqueCodes(codes: Array<string | undefined>): string[] {
  return [...new Set(codes.filter((code): code is string => Boolean(code)))];
}

export function collectAirportCodesFromCriteria(
  criteria: Partial<FlightSearchCriteria>,
): string[] {
  if (criteria.tripType === 'MULTI_CITY' && criteria.legs?.length) {
    return uniqueCodes(criteria.legs.flatMap((leg) => [leg.from, leg.to]));
  }

  return uniqueCodes([criteria.from, criteria.to]);
}

export function buildFormValuesFromCriteria(
  criteria: Partial<FlightSearchCriteria>,
  airportsByCode: Map<string, Airport>,
): FlightSearchFormValues {
  const departureDate = criteria.departure ?? todayIsoDate();
  const defaults = createDefaultFlightSearchValues({
    tripType: criteria.tripType ?? 'ROUND_TRIP',
    departureDate,
    returnDate:
      criteria.returnDate ??
      (criteria.tripType === 'ONE_WAY' ? '' : addDaysIso(departureDate, 7)),
    adults: criteria.adults ?? 1,
    children: criteria.children ?? 0,
    infants: criteria.infants ?? 0,
    cabinClass: criteria.cabinClass ?? 'ECONOMY',
  });

  if (criteria.tripType === 'MULTI_CITY' && criteria.legs?.length) {
    const legs = criteria.legs.map((leg) => ({
      origin: airportsByCode.get(leg.from) ?? null,
      destination: airportsByCode.get(leg.to) ?? null,
      departureDate: leg.departure,
    }));

    while (legs.length < 2) {
      legs.push(createEmptyLeg(departureDate));
    }

    return {
      ...defaults,
      tripType: 'MULTI_CITY',
      origin: legs[0]?.origin ?? null,
      destination: legs[0]?.destination ?? null,
      departureDate: legs[0]?.departureDate ?? departureDate,
      legs,
    };
  }

  return {
    ...defaults,
    origin: criteria.from ? (airportsByCode.get(criteria.from) ?? null) : null,
    destination: criteria.to ? (airportsByCode.get(criteria.to) ?? null) : null,
  };
}

export function useFlightSearchHydration(searchParams: URLSearchParams) {
  const paramsKey = searchParams.toString();
  const parsed = useMemo(
    () => parseFlightSearchParams(new URLSearchParams(paramsKey)),
    [paramsKey],
  );
  const codes = useMemo(
    () => (parsed ? collectAirportCodesFromCriteria(parsed) : []),
    [parsed],
  );
  const codesKey = codes.join(',');

  const airportQueries = useQueries({
    queries: codes.map((code) => ({
      queryKey: airportKeys.detail(code),
      queryFn: () => getAirportByCode(code),
    })),
  });

  const isHydrating = codes.length > 0 && airportQueries.some((query) => query.isPending);
  const airportsResolvedKey = airportQueries
    .map((query) => `${query.status}:${query.data?.code ?? ''}`)
    .join('|');

  const defaultValues = useMemo(() => {
    if (!parsed) {
      return createDefaultFlightSearchValues({
        returnDate: addDaysIso(todayIsoDate(), 7),
      });
    }

    const airportsByCode = new Map<string, Airport>();
    codes.forEach((code, index) => {
      const airport = airportQueries[index]?.data;
      if (airport) {
        airportsByCode.set(code, airport);
      }
    });

    return buildFormValuesFromCriteria(parsed, airportsByCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by codes/resolution snapshots
  }, [airportsResolvedKey, codesKey, paramsKey, parsed]);

  return {
    parsedCriteria: parsed,
    defaultValues,
    isHydrating,
    hydrationKey: `${paramsKey}::${airportsResolvedKey}`,
  };
}
