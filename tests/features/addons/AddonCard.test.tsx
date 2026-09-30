import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddonCard } from '@/features/addons/components/AddonCard';
import type { Addon } from '@/features/addons/constants/addons';
import { renderWithProviders } from '@tests/utils/test-utils';

const availableAddon: Addon = {
  id: 'priority-boarding',
  name: 'Priority boarding',
  description: 'Board early and settle in before general boarding.',
  price: 18,
  availability: true,
  passengerApplicability: ['ADULT', 'CHILD'],
};

const unavailableAddon: Addon = {
  ...availableAddon,
  id: 'lounge-access',
  name: 'Lounge access',
  availability: false,
  passengerApplicability: ['ADULT'],
};

describe('AddonCard', () => {
  it('renders available addon details and calls onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const onRemove = jest.fn();

    renderWithProviders(
      <AddonCard
        addon={availableAddon}
        selected={false}
        passengerLabel="Ada Lovelace"
        onSelect={onSelect}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText('Priority boarding')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText(availableAddon.description)).toBeInTheDocument();
    expect(screen.getByText(/\$18/)).toBeInTheDocument();
    expect(screen.getByText(/Applies to:\s*Adult, Child/i)).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('shows selected state and calls onRemove', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const onRemove = jest.fn();

    renderWithProviders(
      <AddonCard
        addon={availableAddon}
        selected
        onSelect={onSelect}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText('Selected')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('marks unavailable addons and disables Add', () => {
    const onSelect = jest.fn();

    renderWithProviders(
      <AddonCard
        addon={unavailableAddon}
        selected={false}
        onSelect={onSelect}
        onRemove={jest.fn()}
      />,
    );

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/Applies to:\s*Adult$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('disables Remove when the card is disabled while selected', () => {
    const onRemove = jest.fn();

    renderWithProviders(
      <AddonCard
        addon={availableAddon}
        selected
        disabled
        onSelect={jest.fn()}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('disables Add when disabled prop is set on an available addon', () => {
    renderWithProviders(
      <AddonCard
        addon={availableAddon}
        selected={false}
        disabled
        onSelect={jest.fn()}
        onRemove={jest.fn()}
      />,
    );

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });
});
