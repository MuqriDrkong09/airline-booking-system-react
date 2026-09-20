import {
  countActiveFlightFilters,
  DEFAULT_FLIGHT_FILTERS,
  parseFlightFilterParams,
  writeFlightFilterParams,
} from '@/features/flights/utils/filterParams';

describe('flight filter URL params', () => {
  it('round-trips filter state through query params', () => {
    const params = writeFlightFilterParams(new URLSearchParams('from=KUL&to=NRT'), {
      ...DEFAULT_FLIGHT_FILTERS,
      priceMin: 200,
      priceMax: 800,
      airlines: ['MH', 'SQ'],
      stops: [0, 1],
      departureHourStart: 6,
      departureHourEnd: 18,
      arrivalHourStart: 10,
      arrivalHourEnd: 22,
      durationMax: 480,
      cabinClasses: ['ECONOMY', 'BUSINESS'],
      refundableOnly: true,
      baggageIncludedOnly: true,
    });

    expect(params.get('from')).toBe('KUL');
    expect(params.get('f_price')).toBe('200-800');
    expect(params.get('f_airlines')).toBe('MH,SQ');
    expect(params.get('f_stops')).toBe('0,1');
    expect(params.get('f_dep')).toBe('6-18');
    expect(params.get('f_arr')).toBe('10-22');
    expect(params.get('f_duration')).toBe('480');
    expect(params.get('f_cabin')).toBe('ECONOMY,BUSINESS');
    expect(params.get('f_refundable')).toBe('1');
    expect(params.get('f_baggage')).toBe('1');

    expect(parseFlightFilterParams(params)).toMatchObject({
      priceMin: 200,
      priceMax: 800,
      airlines: ['MH', 'SQ'],
      stops: [0, 1],
      departureHourStart: 6,
      departureHourEnd: 18,
      refundableOnly: true,
      baggageIncludedOnly: true,
    });
  });

  it('counts active filter dimensions', () => {
    const count = countActiveFlightFilters(
      {
        ...DEFAULT_FLIGHT_FILTERS,
        airlines: ['MH'],
        refundableOnly: true,
        stops: [0],
      },
      { priceMin: 100, priceMax: 900, durationMax: 600 },
    );

    expect(count).toBe(3);
  });

  it('omits unconstrained bounds from the URL', () => {
    const params = writeFlightFilterParams(
      new URLSearchParams(),
      {
        ...DEFAULT_FLIGHT_FILTERS,
        priceMin: 100,
        priceMax: 900,
        durationMax: 600,
        departureHourStart: 0,
        departureHourEnd: 24,
      },
      { priceMin: 100, priceMax: 900, durationMax: 600 },
    );

    expect(params.get('f_price')).toBeNull();
    expect(params.get('f_duration')).toBeNull();
    expect(params.get('f_dep')).toBeNull();
  });
});
