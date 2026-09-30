import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddonSelector } from '@/features/addons/components/AddonSelector';
import type { AddonPassengerType } from '@/features/addons/constants/addons';
import type { AddonPassenger, AddonSelection } from '@/features/addons/types/addon';
import { renderWithProviders } from '@tests/utils/test-utils';

const adult: AddonPassenger = {
  id: 'adult-1',
  type: 'ADULT',
  displayName: 'Ada Lovelace',
};

const infant: AddonPassenger = {
  id: 'infant-1',
  type: 'INFANT',
  displayName: 'Baby Lovelace',
};

function passengerCard(displayName: string): HTMLElement {
  const title = screen.getByText((content, element) => {
    return (
      element?.classList.contains('MuiCardHeader-title') === true && content === displayName
    );
  });
  const card = title.closest('.MuiCard-root');
  if (!card) {
    throw new Error(`Passenger card not found for ${displayName}`);
  }
  return card as HTMLElement;
}

function addonCard(name: string, scope?: HTMLElement): HTMLElement {
  const root = scope ?? document.body;
  const title = within(root).getByText((content, element) => {
    return element?.classList.contains('MuiCardHeader-title') === true && content === name;
  });
  const card = title.closest('.MuiCard-root');
  if (!card) {
    throw new Error(`Addon card not found for ${name}`);
  }
  return card as HTMLElement;
}

describe('AddonSelector', () => {
  it('lists applicable addons for an adult passenger', () => {
    renderWithProviders(
      <AddonSelector passengers={[adult]} selections={[]} onChange={jest.fn()} />,
    );

    const card = passengerCard('Ada Lovelace');
    expect(
      within(card).getByText(/select optional extras for this traveler/i),
    ).toBeInTheDocument();
    expect(within(card).getByText('Priority boarding')).toBeInTheDocument();
    expect(within(card).getByText('Lounge access')).toBeInTheDocument();
    expect(within(card).getAllByRole('button', { name: 'Add' }).length).toBeGreaterThan(0);
  });

  it('calls onChange when an addon is added or removed', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    const { rerender } = renderWithProviders(
      <AddonSelector passengers={[adult]} selections={[]} onChange={onChange} />,
    );

    await user.click(
      within(addonCard('Priority boarding')).getByRole('button', { name: 'Add' }),
    );

    expect(onChange).toHaveBeenCalledWith([
      { addonId: 'priority-boarding', passengerId: 'adult-1' },
    ]);

    const selected: AddonSelection[] = [
      { addonId: 'priority-boarding', passengerId: 'adult-1' },
    ];
    onChange.mockClear();
    rerender(
      <AddonSelector passengers={[adult]} selections={selected} onChange={onChange} />,
    );

    await user.click(
      within(addonCard('Priority boarding')).getByRole('button', { name: 'Remove' }),
    );

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('shows infant-applicable addons such as travel insurance', () => {
    renderWithProviders(
      <AddonSelector passengers={[infant]} selections={[]} onChange={jest.fn()} />,
    );

    const card = passengerCard('Baby Lovelace');
    expect(within(card).getByText('Travel insurance')).toBeInTheDocument();
    expect(within(card).queryByText('Lounge access')).not.toBeInTheDocument();
    expect(within(card).queryByText('Priority boarding')).not.toBeInTheDocument();
  });

  it('renders multiple passenger sections independently', () => {
    renderWithProviders(
      <AddonSelector
        passengers={[adult, infant]}
        selections={[{ addonId: 'travel-insurance', passengerId: 'infant-1' }]}
        onChange={jest.fn()}
      />,
    );

    expect(passengerCard('Ada Lovelace')).toBeInTheDocument();
    expect(passengerCard('Baby Lovelace')).toBeInTheDocument();

    expect(
      within(addonCard('Travel insurance', passengerCard('Baby Lovelace'))).getByRole(
        'button',
        { name: 'Remove' },
      ),
    ).toBeInTheDocument();
  });

  it('shows the empty state when no addons apply to a passenger', () => {
    const unmatched: AddonPassenger = {
      id: 'other-1',
      type: 'UNKNOWN' as AddonPassengerType,
      displayName: 'Other Traveler',
    };

    renderWithProviders(
      <AddonSelector passengers={[unmatched]} selections={[]} onChange={jest.fn()} />,
    );

    const card = passengerCard('Other Traveler');
    expect(within(card).getByText(/no add-ons apply to this passenger/i)).toBeInTheDocument();
    expect(
      within(card).getByText(/infants only qualify for travel insurance when offered/i),
    ).toBeInTheDocument();
    expect(within(card).queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();
  });
});
