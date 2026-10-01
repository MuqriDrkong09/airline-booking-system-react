import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaggageSelectionPanel } from '@/features/baggage/components/BaggageSelectionPanel';
import type { BaggagePassenger } from '@/features/baggage/types/baggage';
import { useBookingStore } from '@/features/booking';
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

const secondAdult: BaggagePassenger = {
  id: 'adult-2',
  type: 'ADULT',
  displayName: 'Alan Turing',
};

describe('BaggageSelectionPanel', () => {
  beforeEach(() => {
    act(() => {
      useBookingStore.getState().clearBooking();
      void useBookingStore.persist.clearStorage();
    });
  });

  it('renders passengers and saves baggage choices', async () => {
    const user = userEvent.setup();
    const onSaved = jest.fn();

    renderWithProviders(
      <BaggageSelectionPanel
        flightId="FL-100"
        cabinClass="ECONOMY"
        passengers={[adult, infant]}
        onSaved={onSaved}
      />,
    );

    expect(screen.getAllByText('Ada Lovelace').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Baby Lovelace').length).toBeGreaterThan(0);    expect(
      screen.getByText(/Infants travel with a 7KG cabin bag only/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Save baggage/i }));

    expect(screen.getByText(/Baggage saved/i)).toBeInTheDocument();
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(useBookingStore.getState().flightId).toBe('FL-100');
    expect(useBookingStore.getState().baggage).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ passengerId: 'adult-1', cabinKg: 7 }),
        expect.objectContaining({
          passengerId: 'infant-1',
          cabinKg: 7,
          checkedKg: 0,
          additionalKg: 0,
        }),
      ]),
    );
  });

  it('syncs selection changes into the booking store', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <BaggageSelectionPanel
        flightId="FL-100"
        cabinClass="ECONOMY"
        passengers={[adult, secondAdult]}
      />,
    );

    const cabinGroup = screen.getByRole('radiogroup', {
      name: /Ada Lovelace cabin baggage/i,
    });
    await user.click(within(cabinGroup).getByRole('radio', { name: /20KG/i }));

    expect(useBookingStore.getState().baggage).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ passengerId: 'adult-1', cabinKg: 20 }),
        expect.objectContaining({ passengerId: 'adult-2', cabinKg: 7 }),
      ]),
    );
    expect(useBookingStore.getState().baggageTotal).toBeGreaterThan(0);
  });

  it('shows a validation error when additional baggage is chosen without checked', async () => {
    const user = userEvent.setup();
    const onSaved = jest.fn();

    act(() => {
      useBookingStore.getState().setBaggage({
        flightId: 'FL-100',
        cabinClass: 'ECONOMY',
        baggage: [
          {
            passengerId: 'adult-1',
            cabinKg: 7,
            checkedKg: 0,
            additionalKg: 20,
          },
        ],
        baggageTotal: 40,
      });
    });

    renderWithProviders(
      <BaggageSelectionPanel
        flightId="FL-100"
        cabinClass="ECONOMY"
        passengers={[adult]}
        onSaved={onSaved}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Save baggage/i }));

    expect(
      screen.getByText(/Add checked baggage before an extra bag for Ada Lovelace/i),
    ).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Close/i }));
    expect(
      screen.queryByText(/Add checked baggage before an extra bag for Ada Lovelace/i),
    ).not.toBeInTheDocument();
  });

  it('hydrates matching stored selections for the same flight', () => {
    act(() => {
      useBookingStore.getState().setBaggage({
        flightId: 'FL-100',
        cabinClass: 'ECONOMY',
        baggage: [
          {
            passengerId: 'adult-1',
            cabinKg: 20,
            checkedKg: 30,
            additionalKg: 0,
          },
        ],
        baggageTotal: 80,
      });
    });

    renderWithProviders(
      <BaggageSelectionPanel
        flightId="FL-100"
        cabinClass="ECONOMY"
        passengers={[adult]}
      />,
    );

    const cabinGroup = screen.getByRole('radiogroup', {
      name: /Ada Lovelace cabin baggage/i,
    });
    expect(within(cabinGroup).getByRole('radio', { name: /20KG/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    const checkedGroup = screen.getByRole('radiogroup', {
      name: /Ada Lovelace checked baggage/i,
    });
    expect(within(checkedGroup).getByRole('radio', { name: /30KG/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('ignores stored baggage when the flight id does not match', () => {
    act(() => {
      useBookingStore.getState().setBaggage({
        flightId: 'FL-OTHER',
        cabinClass: 'ECONOMY',
        baggage: [
          {
            passengerId: 'adult-1',
            cabinKg: 40,
            checkedKg: 40,
            additionalKg: 0,
          },
        ],
        baggageTotal: 120,
      });
    });

    renderWithProviders(
      <BaggageSelectionPanel
        flightId="FL-100"
        cabinClass="ECONOMY"
        passengers={[adult]}
      />,
    );

    const cabinGroup = screen.getByRole('radiogroup', {
      name: /Ada Lovelace cabin baggage/i,
    });
    expect(within(cabinGroup).getByRole('radio', { name: /7KG/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('dismisses the saved success alert', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <BaggageSelectionPanel
        flightId="FL-100"
        cabinClass="ECONOMY"
        passengers={[adult]}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Save baggage/i }));
    expect(screen.getByText(/Baggage saved/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Close/i }));
    expect(screen.queryByText(/Baggage saved/i)).not.toBeInTheDocument();
  });

  it('falls back to a default selection when a new passenger is added', () => {
    const { rerender } = renderWithProviders(
      <BaggageSelectionPanel
        flightId="FL-100"
        cabinClass="ECONOMY"
        passengers={[adult]}
      />,
    );

    rerender(
      <BaggageSelectionPanel
        flightId="FL-100"
        cabinClass="ECONOMY"
        passengers={[adult, secondAdult]}
      />,
    );

    expect(screen.getAllByText('Alan Turing').length).toBeGreaterThan(0);
    const cabinGroup = screen.getByRole('radiogroup', {
      name: /Alan Turing cabin baggage/i,
    });
    expect(within(cabinGroup).getByRole('radio', { name: /7KG/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });
});
