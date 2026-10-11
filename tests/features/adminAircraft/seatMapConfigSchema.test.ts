import {
  aircraftConfiguredSeatSchema,
  aircraftSeatMapConfigSchema,
} from '@/features/adminAircraft/schemas/seatMapConfigSchema';
import type { AircraftConfiguredSeatInput, AircraftSeatMapConfigInput } from '@/features/adminAircraft/schemas/seatMapConfigSchema';

function makeSeat(
  overrides: Partial<AircraftConfiguredSeatInput> = {},
): AircraftConfiguredSeatInput {
  return {
    id: 'seat-1-A',
    row: 1,
    column: 'A',
    label: '1A',
    cabinClass: 'ECONOMY',
    seatType: 'STANDARD',
    price: 25,
    emergencyExit: false,
    disabled: false,
    ...overrides,
  };
}

function makeConfig(
  overrides: Partial<AircraftSeatMapConfigInput> = {},
): AircraftSeatMapConfigInput {
  return {
    layoutKey: 'Test T1',
    rows: 2,
    columns: ['A', '|', 'B'],
    cabins: [
      {
        cabinClass: 'ECONOMY',
        seatCount: 2,
        columns: ['A', '|', 'B'],
        startRow: 1,
        rowCount: 1,
      },
    ],
    seats: [
      makeSeat({ id: 'seat-1-A', row: 1, column: 'A', label: '1A' }),
      makeSeat({ id: 'seat-1-B', row: 1, column: 'B', label: '1B' }),
    ],
    version: 1,
    ...overrides,
  };
}

function issueMessages(result: { success: false; error: { issues: { message: string }[] } }) {
  return result.error.issues.map((issue) => issue.message);
}

describe('aircraftConfiguredSeatSchema', () => {
  it('parses a valid seat and uppercases column and label', () => {
    const parsed = aircraftConfiguredSeatSchema.parse(
      makeSeat({ column: 'a', label: '1a' }),
    );

    expect(parsed.column).toBe('A');
    expect(parsed.label).toBe('1A');
  });

  it('accepts emergency-exit and unavailable seats when flags match', () => {
    expect(
      aircraftConfiguredSeatSchema.parse(
        makeSeat({
          seatType: 'EMERGENCY_EXIT',
          emergencyExit: true,
        }),
      ).seatType,
    ).toBe('EMERGENCY_EXIT');

    expect(
      aircraftConfiguredSeatSchema.parse(
        makeSeat({
          seatType: 'UNAVAILABLE',
          disabled: true,
        }),
      ).seatType,
    ).toBe('UNAVAILABLE');
  });

  it('rejects invalid seat field values', () => {
    expect(aircraftConfiguredSeatSchema.safeParse(makeSeat({ id: '' })).success).toBe(false);
    expect(aircraftConfiguredSeatSchema.safeParse(makeSeat({ row: 1.5 })).success).toBe(false);
    expect(aircraftConfiguredSeatSchema.safeParse(makeSeat({ row: 0 })).success).toBe(false);
    expect(aircraftConfiguredSeatSchema.safeParse(makeSeat({ row: 81 })).success).toBe(false);
    expect(aircraftConfiguredSeatSchema.safeParse(makeSeat({ column: 'AB' })).success).toBe(false);
    expect(aircraftConfiguredSeatSchema.safeParse(makeSeat({ label: '' })).success).toBe(false);
    expect(
      aircraftConfiguredSeatSchema.safeParse(makeSeat({ label: '123456789' })).success,
    ).toBe(false);
    expect(aircraftConfiguredSeatSchema.safeParse(makeSeat({ price: -1 })).success).toBe(false);
    expect(aircraftConfiguredSeatSchema.safeParse(makeSeat({ price: 10_001 })).success).toBe(
      false,
    );
  });

  it('requires emergencyExit for EMERGENCY_EXIT seat type', () => {
    const result = aircraftConfiguredSeatSchema.safeParse(
      makeSeat({ seatType: 'EMERGENCY_EXIT', emergencyExit: false }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(issueMessages(result)).toContain(
        'Emergency-exit seat type requires the emergency exit flag',
      );
    }
  });

  it('requires disabled for UNAVAILABLE seat type', () => {
    const result = aircraftConfiguredSeatSchema.safeParse(
      makeSeat({ seatType: 'UNAVAILABLE', disabled: false }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(issueMessages(result)).toContain(
        'Unavailable seat type requires the disabled flag',
      );
    }
  });
});

describe('aircraftSeatMapConfigSchema', () => {
  it('parses a valid seat map config', () => {
    const parsed = aircraftSeatMapConfigSchema.parse(makeConfig({ notes: '  trimmed  ' }));

    expect(parsed.layoutKey).toBe('Test T1');
    expect(parsed.columns).toEqual(['A', '|', 'B']);
    expect(parsed.seats).toHaveLength(2);
    expect(parsed.notes).toBe('trimmed');
  });

  it('allows omitting optional notes', () => {
    const parsed = aircraftSeatMapConfigSchema.parse(makeConfig());
    expect(parsed.notes).toBeUndefined();
  });

  it('rejects invalid top-level config fields', () => {
    expect(
      aircraftSeatMapConfigSchema.safeParse(makeConfig({ layoutKey: '' })).success,
    ).toBe(false);
    expect(
      aircraftSeatMapConfigSchema.safeParse(makeConfig({ layoutKey: 'x'.repeat(121) }))
        .success,
    ).toBe(false);
    expect(aircraftSeatMapConfigSchema.safeParse(makeConfig({ rows: 0 })).success).toBe(false);
    expect(aircraftSeatMapConfigSchema.safeParse(makeConfig({ rows: 81 })).success).toBe(false);
    expect(aircraftSeatMapConfigSchema.safeParse(makeConfig({ columns: [] })).success).toBe(
      false,
    );
    expect(aircraftSeatMapConfigSchema.safeParse(makeConfig({ seats: [] })).success).toBe(false);
    expect(aircraftSeatMapConfigSchema.safeParse(makeConfig({ version: 0 })).success).toBe(false);
    expect(
      aircraftSeatMapConfigSchema.safeParse(makeConfig({ notes: 'n'.repeat(501) })).success,
    ).toBe(false);
    expect(
      aircraftSeatMapConfigSchema.safeParse(
        makeConfig({ columns: ['A', '1'] as unknown as string[] }),
      ).success,
    ).toBe(false);
  });

  it('rejects cabin sections with empty columns', () => {
    const result = aircraftSeatMapConfigSchema.safeParse(
      makeConfig({
        cabins: [
          {
            cabinClass: 'ECONOMY',
            seatCount: 0,
            columns: [],
            startRow: 1,
            rowCount: 1,
          },
        ],
      }),
    );

    expect(result.success).toBe(false);
  });

  it('rejects duplicate column letters', () => {
    const result = aircraftSeatMapConfigSchema.safeParse(
      makeConfig({
        columns: ['A', 'a', 'B'],
        seats: [
          makeSeat({ id: 'seat-1-A', column: 'A', label: '1A' }),
          makeSeat({ id: 'seat-1-B', column: 'B', label: '1B' }),
        ],
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(issueMessages(result)).toContain('Column letters must be unique');
    }
  });

  it('rejects layouts that only include aisle markers', () => {
    const result = aircraftSeatMapConfigSchema.safeParse(
      makeConfig({
        columns: ['|'],
        seats: [makeSeat()],
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(issueMessages(result)).toContain('Include at least one seat column letter');
      expect(issueMessages(result)).toContain(
        'Seat column must exist in the layout columns',
      );
    }
  });

  it('rejects duplicate seat ids, labels, and positions', () => {
    const duplicateId = aircraftSeatMapConfigSchema.safeParse(
      makeConfig({
        seats: [
          makeSeat({ id: 'dup', column: 'A', label: '1A' }),
          makeSeat({ id: 'dup', column: 'B', label: '1B' }),
        ],
      }),
    );
    expect(duplicateId.success).toBe(false);
    if (!duplicateId.success) {
      expect(issueMessages(duplicateId)).toContain('Seat id must be unique');
    }

    const duplicateLabel = aircraftSeatMapConfigSchema.safeParse(
      makeConfig({
        seats: [
          makeSeat({ id: 'seat-1-A', column: 'A', label: 'SAME' }),
          makeSeat({ id: 'seat-1-B', column: 'B', label: 'SAME' }),
        ],
      }),
    );
    expect(duplicateLabel.success).toBe(false);
    if (!duplicateLabel.success) {
      expect(issueMessages(duplicateLabel)).toContain('Seat label must be unique');
    }

    const duplicatePosition = aircraftSeatMapConfigSchema.safeParse(
      makeConfig({
        seats: [
          makeSeat({ id: 'seat-1-A', column: 'A', label: '1A' }),
          makeSeat({ id: 'seat-1-B', column: 'A', label: '1B' }),
        ],
      }),
    );
    expect(duplicatePosition.success).toBe(false);
    if (!duplicatePosition.success) {
      expect(issueMessages(duplicatePosition)).toContain('Seat position must be unique');
    }
  });

  it('rejects seats outside the configured row and column layout', () => {
    const badRow = aircraftSeatMapConfigSchema.safeParse(
      makeConfig({
        rows: 1,
        seats: [makeSeat({ row: 2, column: 'A', label: '2A' })],
      }),
    );
    expect(badRow.success).toBe(false);
    if (!badRow.success) {
      expect(issueMessages(badRow)).toContain('Row must be between 1 and 1');
    }

    const badColumn = aircraftSeatMapConfigSchema.safeParse(
      makeConfig({
        columns: ['A'],
        seats: [makeSeat({ column: 'B', label: '1B' })],
      }),
    );
    expect(badColumn.success).toBe(false);
    if (!badColumn.success) {
      expect(issueMessages(badColumn)).toContain(
        'Seat column must exist in the layout columns',
      );
    }
  });

  it('accepts unique seats across multiple rows when layout is valid', () => {
    const parsed = aircraftSeatMapConfigSchema.parse(
      makeConfig({
        rows: 2,
        columns: ['A', 'B'],
        seats: [
          makeSeat({ id: 'seat-1-A', row: 1, column: 'A', label: '1A' }),
          makeSeat({ id: 'seat-1-B', row: 1, column: 'B', label: '1B' }),
          makeSeat({ id: 'seat-2-A', row: 2, column: 'A', label: '2A' }),
          makeSeat({
            id: 'seat-2-B',
            row: 2,
            column: 'B',
            label: '2B',
            seatType: 'PREMIUM',
            price: 55,
          }),
        ],
      }),
    );

    expect(parsed.seats).toHaveLength(4);
    expect(parsed.seats[3]?.seatType).toBe('PREMIUM');
  });
});
