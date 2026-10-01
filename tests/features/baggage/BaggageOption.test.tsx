import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaggageOption } from '@/features/baggage/components/BaggageOption';
import { formatBaggageWeight } from '@/features/baggage/constants/baggage';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('BaggageOption', () => {
  it('renders None for zero kilograms and shows a price label', () => {
    renderWithProviders(
      <BaggageOption
        name="cabin"
        kg={0}
        selected={false}
        priceLabel="Free"
        onSelect={jest.fn()}
      />,
    );

    const option = screen.getByRole('radio', { name: /None/i });
    expect(option).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('renders a formatted weight when kilograms are positive', () => {
    renderWithProviders(
      <BaggageOption
        name="checked"
        kg={20}
        selected
        priceLabel="RM 35"
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText(formatBaggageWeight(20))).toBeInTheDocument();
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('RM 35')).toBeInTheDocument();
  });

  it('shows Included instead of a price when the option is included', () => {
    renderWithProviders(
      <BaggageOption
        name="cabin"
        kg={7}
        selected={false}
        included
        priceLabel="RM 10"
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText('Included')).toBeInTheDocument();
    expect(screen.queryByText('RM 10')).not.toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    renderWithProviders(
      <BaggageOption name="extra" kg={30} selected={false} onSelect={onSelect} />,
    );

    await user.click(screen.getByRole('radio'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('does not call onSelect when disabled', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    renderWithProviders(
      <BaggageOption
        name="extra"
        kg={40}
        selected={false}
        disabled
        onSelect={onSelect}
      />,
    );

    const option = screen.getByRole('radio');
    expect(option).toBeDisabled();
    expect(option).toHaveAttribute('aria-disabled', 'true');

    await user.click(option);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('guards onSelect inside onClick when disabled is true', () => {
    const onSelect = jest.fn();
    let capturedClick: (() => void) | undefined;

    const { container } = renderWithProviders(
      <BaggageOption
        name="extra"
        kg={40}
        selected={false}
        disabled
        onSelect={onSelect}
      />,
    );

    const option = container.querySelector('button');
    expect(option).toBeTruthy();

    // React skips dispatching clicks for disabled buttons; call the prop handler
    // through the fiber props so the `if (!disabled)` false branch is covered.
    const key = Object.keys(option!).find((name) => name.startsWith('__reactProps$'));
    const props = key ? (option as unknown as Record<string, { onClick?: () => void }>)[key] : undefined;
    capturedClick = props?.onClick;
    expect(typeof capturedClick).toBe('function');

    capturedClick?.();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders an empty secondary label when no price is provided', () => {
    renderWithProviders(
      <BaggageOption name="cabin" kg={7} selected={false} onSelect={jest.fn()} />,
    );

    expect(screen.getByText(formatBaggageWeight(7))).toBeInTheDocument();
    expect(screen.queryByText('Included')).not.toBeInTheDocument();
  });
});
