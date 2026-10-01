import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaggageSelector } from '@/features/baggage/components/BaggageSelector';
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

const baseSelection: PassengerBaggageSelection = {
  passengerId: 'adult-1',
  cabinKg: 7,
  checkedKg: 0,
  additionalKg: 0,
};

describe('BaggageSelector', () => {
  it('renders adult allowance copy and cabin/checked included labels', () => {
    renderWithProviders(
      <BaggageSelector
        passenger={adult}
        allowance={economyAllowance}
        selection={baseSelection}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(
      screen.getByText(/Cabin included 7KG · checked included 20KG/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Passenger baggage fees \$0/i)).toBeInTheDocument();

    const cabinGroup = screen.getByRole('radiogroup', {
      name: /Ada Lovelace cabin baggage/i,
    });
    expect(within(cabinGroup).getByRole('radio', { name: /7KG/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(within(cabinGroup).getByText('Included')).toBeInTheDocument();
  });

  it('shows none when the fare has no checked allowance', () => {
    renderWithProviders(
      <BaggageSelector
        passenger={adult}
        allowance={noCheckedAllowance}
        selection={baseSelection}
        onChange={jest.fn()}
      />,
    );

    expect(
      screen.getByText(/Cabin included 7KG · checked included none/i),
    ).toBeInTheDocument();
  });

  it('renders infant restrictions and keeps non-cabin options disabled', () => {
    renderWithProviders(
      <BaggageSelector
        passenger={infant}
        allowance={economyAllowance}
        selection={{
          passengerId: 'infant-1',
          cabinKg: 7,
          checkedKg: 0,
          additionalKg: 0,
        }}
        onChange={jest.fn()}
      />,
    );

    expect(
      screen.getByText(/Infants travel with a 7KG cabin bag only/i),
    ).toBeInTheDocument();

    const cabinGroup = screen.getByRole('radiogroup', {
      name: /Baby Lovelace cabin baggage/i,
    });
    expect(within(cabinGroup).getByRole('radio', { name: /7KG/i })).not.toBeDisabled();
    expect(within(cabinGroup).getByRole('radio', { name: /20KG/i })).toBeDisabled();

    const checkedGroup = screen.getByRole('radiogroup', {
      name: /Baby Lovelace checked baggage/i,
    });
    expect(within(checkedGroup).getByRole('radio', { name: /None/i })).toBeDisabled();

    const additionalGroup = screen.getByRole('radiogroup', {
      name: /Baby Lovelace additional baggage/i,
    });
    expect(within(additionalGroup).getByRole('radio', { name: /None/i })).toBeDisabled();
  });

  it('notifies onChange when cabin, checked, and additional options are selected', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const selection: PassengerBaggageSelection = {
      passengerId: 'adult-1',
      cabinKg: 7,
      checkedKg: 20,
      additionalKg: 0,
    };

    renderWithProviders(
      <BaggageSelector
        passenger={adult}
        allowance={economyAllowance}
        selection={selection}
        onChange={onChange}
      />,
    );

    const cabinGroup = screen.getByRole('radiogroup', {
      name: /Ada Lovelace cabin baggage/i,
    });
    await user.click(within(cabinGroup).getByRole('radio', { name: /20KG/i }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...selection,
      cabinKg: 20,
    });

    const checkedGroup = screen.getByRole('radiogroup', {
      name: /Ada Lovelace checked baggage/i,
    });
    await user.click(within(checkedGroup).getByRole('radio', { name: /30KG/i }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...selection,
      checkedKg: 30,
    });

    const additionalGroup = screen.getByRole('radiogroup', {
      name: /Ada Lovelace additional baggage/i,
    });
    await user.click(within(additionalGroup).getByRole('radio', { name: /20KG/i }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...selection,
      additionalKg: 20,
    });
  });

  it('clears additional baggage when checked is set to none', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(
      <BaggageSelector
        passenger={adult}
        allowance={economyAllowance}
        selection={{
          passengerId: 'adult-1',
          cabinKg: 7,
          checkedKg: 20,
          additionalKg: 20,
        }}
        onChange={onChange}
      />,
    );

    const checkedGroup = screen.getByRole('radiogroup', {
      name: /Ada Lovelace checked baggage/i,
    });
    await user.click(within(checkedGroup).getByRole('radio', { name: /None/i }));

    expect(onChange).toHaveBeenCalledWith({
      passengerId: 'adult-1',
      cabinKg: 7,
      checkedKg: 0,
      additionalKg: 0,
    });
  });

  it('disables paid additional options until checked baggage is selected', () => {
    renderWithProviders(
      <BaggageSelector
        passenger={adult}
        allowance={economyAllowance}
        selection={baseSelection}
        onChange={jest.fn()}
      />,
    );

    const additionalGroup = screen.getByRole('radiogroup', {
      name: /Ada Lovelace additional baggage/i,
    });
    expect(within(additionalGroup).getByRole('radio', { name: /None/i })).not.toBeDisabled();
    expect(within(additionalGroup).getByRole('radio', { name: /20KG/i })).toBeDisabled();
  });

  it('allows clearing additional baggage and shows priced fees', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    renderWithProviders(
      <BaggageSelector
        passenger={adult}
        allowance={economyAllowance}
        selection={{
          passengerId: 'adult-1',
          cabinKg: 20,
          checkedKg: 30,
          additionalKg: 20,
        }}
        onChange={onChange}
      />,
    );

    expect(screen.getByText(/Passenger baggage fees \$/i)).toBeInTheDocument();

    const additionalGroup = screen.getByRole('radiogroup', {
      name: /Ada Lovelace additional baggage/i,
    });
    await user.click(within(additionalGroup).getByRole('radio', { name: /None/i }));

    expect(onChange).toHaveBeenCalledWith({
      passengerId: 'adult-1',
      cabinKg: 20,
      checkedKg: 30,
      additionalKg: 0,
    });
  });
});
