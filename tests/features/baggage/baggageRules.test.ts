import {
  calculateBaggageTotal,
  getAllowanceForCabin,
  pricePassengerBaggage,
  validateBaggageSelection,
} from '@/features/baggage';
import type { BaggagePassenger, PassengerBaggageSelection } from '@/features/baggage';

const adult: BaggagePassenger = {
  id: 'adult-1',
  type: 'ADULT',
  displayName: 'Ada Lovelace',
};

const infant: BaggagePassenger = {
  id: 'infant-1',
  type: 'INFANT',
  displayName: 'Grace Hopper',
};

describe('baggage rules', () => {
  const economy = getAllowanceForCabin('ECONOMY');

  it('includes economy cabin 7KG and checked 20KG in the fare', () => {
    expect(economy).toEqual({ cabinKg: 7, checkedKg: 20 });
    const selection: PassengerBaggageSelection = {
      passengerId: adult.id,
      cabinKg: 7,
      checkedKg: 20,
      additionalKg: 0,
    };
    expect(pricePassengerBaggage(selection, economy, 'ADULT').total).toBe(0);
  });

  it('charges cabin and checked bags above the allowance and always charges additional bags', () => {
    const selection: PassengerBaggageSelection = {
      passengerId: adult.id,
      cabinKg: 20,
      checkedKg: 30,
      additionalKg: 7,
    };
    const line = pricePassengerBaggage(selection, economy, 'ADULT');
    expect(line.cabin).toBe(35);
    expect(line.checked).toBe(55);
    expect(line.additional).toBe(15);
    expect(line.total).toBe(105);
    expect(calculateBaggageTotal([selection], [adult], economy)).toBe(105);
  });

  it('does not charge infants for the included 7KG cabin bag', () => {
    const selection: PassengerBaggageSelection = {
      passengerId: infant.id,
      cabinKg: 7,
      checkedKg: 0,
      additionalKg: 0,
    };
    expect(pricePassengerBaggage(selection, economy, 'INFANT').total).toBe(0);
  });

  it('rejects additional baggage without a checked bag', () => {
    const result = validateBaggageSelection({
      passengers: [adult],
      selections: [
        {
          passengerId: adult.id,
          cabinKg: 7,
          checkedKg: 0,
          additionalKg: 20,
        },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/checked baggage/i);
    }
  });

  it('rejects extra bags for infants', () => {
    const result = validateBaggageSelection({
      passengers: [infant],
      selections: [
        {
          passengerId: infant.id,
          cabinKg: 20,
          checkedKg: 0,
          additionalKg: 0,
        },
      ],
    });
    expect(result.ok).toBe(false);
  });

  it('accepts a valid adult selection', () => {
    const result = validateBaggageSelection({
      passengers: [adult],
      selections: [
        {
          passengerId: adult.id,
          cabinKg: 7,
          checkedKg: 30,
          additionalKg: 20,
        },
      ],
    });
    expect(result.ok).toBe(true);
  });
});
