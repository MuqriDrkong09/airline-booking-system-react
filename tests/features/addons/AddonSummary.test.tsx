import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddonSummary } from '@/features/addons/components/AddonSummary';
import type { AddonPassenger, AddonSelection } from '@/features/addons/types/addon';
import { renderWithProviders } from '@tests/utils/test-utils';

const adult: AddonPassenger = {
  id: 'adult-1',
  type: 'ADULT',
  displayName: 'Ada Lovelace',
};

const child: AddonPassenger = {
  id: 'child-1',
  type: 'CHILD',
  displayName: 'Ada Junior',
};

describe('AddonSummary', () => {
  it('shows an empty state and zero totals by default', () => {
    renderWithProviders(
      <AddonSummary passengers={[adult]} selections={[]} />,
    );

    expect(screen.getByText(/no add-ons selected yet/i)).toBeInTheDocument();
    expect(screen.getByText('Add-ons')).toBeInTheDocument();
    expect(screen.getByText('Baggage + meals + seats')).toBeInTheDocument();
    expect(screen.getByText('Booking total')).toBeInTheDocument();
    expect(screen.getAllByText('$0').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('lists selected addons with passenger names and prices', () => {
    const selections: AddonSelection[] = [
      { addonId: 'priority-boarding', passengerId: 'adult-1' },
      { addonId: 'extra-legroom', passengerId: 'child-1' },
    ];

    renderWithProviders(
      <AddonSummary
        passengers={[adult, child]}
        selections={selections}
        baggageTotal={20}
        mealTotal={15}
        seatTotal={10}
      />,
    );

    expect(screen.getByText('Priority boarding')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('$18')).toBeInTheDocument();

    expect(screen.getByText('Extra legroom')).toBeInTheDocument();
    expect(screen.getByText('Ada Junior')).toBeInTheDocument();
    expect(screen.getAllByText('$45').length).toBeGreaterThanOrEqual(1);

    // Addon total 18 + 45 = 63; baggage+meals+seats = 45; booking = 108
    expect(screen.getByText('$63')).toBeInTheDocument();
    expect(screen.getByText('$108')).toBeInTheDocument();
  });

  it('falls back to passenger id and skips unknown addon ids', () => {
    const selections: AddonSelection[] = [
      { addonId: 'priority-boarding', passengerId: 'ghost-1' },
      { addonId: 'not-a-real-addon', passengerId: 'adult-1' },
    ];

    renderWithProviders(
      <AddonSummary passengers={[adult]} selections={selections} />,
    );

    expect(screen.getByText('Priority boarding')).toBeInTheDocument();
    expect(screen.getByText('ghost-1')).toBeInTheDocument();
    expect(screen.queryByText('not-a-real-addon')).not.toBeInTheDocument();
    expect(screen.getAllByText('$18').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onRemove for a listed addon', async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();
    const selections: AddonSelection[] = [
      { addonId: 'lounge-access', passengerId: 'adult-1' },
    ];

    renderWithProviders(
      <AddonSummary
        passengers={[adult]}
        selections={selections}
        onRemove={onRemove}
      />,
    );

    const summary = screen.getByText('Add-ons summary').closest('.MuiCard-root');
    expect(summary).toBeTruthy();

    await user.click(within(summary as HTMLElement).getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledWith('lounge-access', 'adult-1');
  });

  it('hides remove actions when onRemove is omitted', () => {
    renderWithProviders(
      <AddonSummary
        passengers={[adult]}
        selections={[{ addonId: 'priority-boarding', passengerId: 'adult-1' }]}
      />,
    );

    expect(screen.getByText('Priority boarding')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });
});
