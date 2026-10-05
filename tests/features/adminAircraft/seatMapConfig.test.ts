import {
  applySeatType,
  buildDefaultSeatMapConfig,
  buildSeatsFromLayout,
  createSeedAdminAircraft,
  parseColumnLayout,
  validateSeatMapConfig,
  aircraftSeatMapConfigSchema,
} from '@/features/adminAircraft';

describe('seat map configuration', () => {
  it('builds a default config with rows, columns, and seats', () => {
    const [aircraft] = createSeedAdminAircraft();
    const config = buildDefaultSeatMapConfig(aircraft!);

    expect(config.rows).toBeGreaterThan(0);
    expect(config.columns.length).toBeGreaterThan(0);
    expect(config.seats.length).toBeGreaterThan(0);
    expect(config.seats.every((seat) => seat.seatType === 'STANDARD')).toBe(true);
    expect(validateSeatMapConfig(config).seats.length).toBe(config.seats.length);
  });

  it('parses compact and spaced column layouts', () => {
    expect(parseColumnLayout('A B C | D E F')).toEqual(['A', 'B', 'C', '|', 'D', 'E', 'F']);
    expect(parseColumnLayout('ABC|DEF')).toEqual(['A', 'B', 'C', '|', 'D', 'E', 'F']);
  });

  it('rebuilds seats from layout while preserving prior seat settings', () => {
    const previous = buildSeatsFromLayout({
      rows: 2,
      columns: ['A', '|', 'F'],
      cabinClass: 'ECONOMY',
    });
    const painted = applySeatType(previous[0]!, 'PREMIUM');

    const next = buildSeatsFromLayout({
      rows: 3,
      columns: ['A', '|', 'F'],
      cabinClass: 'BUSINESS',
      previousSeats: [painted, ...previous.slice(1)],
    });

    expect(next).toHaveLength(6);
    expect(next.find((seat) => seat.row === 1 && seat.column === 'A')?.seatType).toBe('PREMIUM');
    expect(next.find((seat) => seat.row === 3 && seat.column === 'A')?.cabinClass).toBe(
      'BUSINESS',
    );
  });

  it('rejects invalid seat maps through zod validation', () => {
    const [aircraft] = createSeedAdminAircraft();
    const config = buildDefaultSeatMapConfig(aircraft!);
    const invalid = {
      ...config,
      seats: [
        {
          ...config.seats[0]!,
          seatType: 'EMERGENCY_EXIT' as const,
          emergencyExit: false,
          disabled: false,
        },
      ],
    };

    const result = aircraftSeatMapConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('applies seat type flags for emergency exit and unavailable', () => {
    const seat = buildSeatsFromLayout({
      rows: 1,
      columns: ['A'],
    })[0]!;

    expect(applySeatType(seat, 'EMERGENCY_EXIT')).toMatchObject({
      seatType: 'EMERGENCY_EXIT',
      emergencyExit: true,
    });
    expect(applySeatType(seat, 'UNAVAILABLE')).toMatchObject({
      seatType: 'UNAVAILABLE',
      disabled: true,
    });
  });
});
