import { screen } from '@testing-library/react';
import { BaggageSummary } from '@/features/baggage/components/BaggageSummary';
import type { BaggageAllowance } from '@/features/baggage/constants/baggage';
import type { BaggagePassenger, PassengerBaggageSelection } from '@/features/baggage/types/baggage';
import { renderWithProviders } from '@tests/utils/test-utils';

const adult: BaggagePassenger = {
  id: 'adult-1',
  type: 'ADULT',
  displayName: 'Ada Lovelace',
};

const infant: BaggagePassenger = {
  id: 'infant-1',
  type: 'INFANT',
  displayName: 'Baby Lovelace',
};

const economyAllowance: BaggageAllowance = { cabinKg: 7, checkedKg: 20 };
const noCheckedAllowance: BaggageAllowance = { cabinKg: 7, checkedKg: 0 };

describe('BaggageSummary', () => {
  it('shows cabin and checked allowance badges with passenger lines and total', () => {
    const selections: PassengerBaggageSelection[] = [
      {
        passengerId: 'adult-1',
        cabinKg: 20,
        checkedKg: 30,
        additionalKg: 20,
      },
      {
        passengerId: 'infant-1',
        cabinKg: 7,
        checkedKg: 0,
        additionalKg: 0,
      },
    ];

    renderWithProviders(
      <BaggageSummary
        allowance={economyAllowance}
        passengers={[adult, infant]}
        selections={selections}
      />,
    );

    expect(screen.getByText('Baggage summary')).toBeInTheDocument();
    expect(screen.getByText('Cabin allowance 7KG')).toBeInTheDocument();
    expect(screen.getByText('Checked allowance 20KG')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText(/Cabin 20KG · Checked 30KG · Extra 20KG · \$/i)).toBeInTheDocument();
    expect(screen.getByText('Baby Lovelace')).toBeInTheDocument();
    expect(screen.getByText(/Cabin 7KG · No checked bag · \$0/i)).toBeInTheDocument();
    expect(screen.getByText('Baggage total')).toBeInTheDocument();
    expect(screen.getByText(/^\$\d+$/)).toBeTruthy();
  });

  it('shows no checked allowance when the fare excludes checked bags', () => {
    renderWithProviders(
      <BaggageSummary
        allowance={noCheckedAllowance}
        passengers={[adult]}
        selections={[
          {
            passengerId: 'adult-1',
            cabinKg: 7,
            checkedKg: 0,
            additionalKg: 0,
          },
        ]}
      />,
    );

    expect(screen.getByText('No checked allowance')).toBeInTheDocument();
    expect(screen.queryByText(/^Checked allowance/i)).not.toBeInTheDocument();
  });

  it('skips passengers without a matching selection', () => {
    renderWithProviders(
      <BaggageSummary
        allowance={economyAllowance}
        passengers={[adult, infant]}
        selections={[
          {
            passengerId: 'adult-1',
            cabinKg: 7,
            checkedKg: 0,
            additionalKg: 0,
          },
        ]}
      />,
    );

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.queryByText('Baby Lovelace')).not.toBeInTheDocument();
  });

  it('omits the extra bag segment when additionalKg is zero', () => {
    renderWithProviders(
      <BaggageSummary
        allowance={economyAllowance}
        passengers={[adult]}
        selections={[
          {
            passengerId: 'adult-1',
            cabinKg: 7,
            checkedKg: 20,
            additionalKg: 0,
          },
        ]}
      />,
    );

    expect(screen.getByText(/Cabin 7KG · Checked 20KG · \$0/i)).toBeInTheDocument();
    expect(screen.queryByText(/Extra \d+KG/i)).not.toBeInTheDocument();
  });
});
