import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddonSelectionPanel } from '@/features/addons/components/AddonSelectionPanel';
import type { AddonPassenger } from '@/features/addons/types/addon';
import { useBookingStore } from '@/features/booking';
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

describe('AddonSelectionPanel', () => {
  beforeEach(() => {
    act(() => {
      useBookingStore.getState().clearBooking();
      void useBookingStore.persist.clearStorage();
    });
  });

  it('saves empty selections and calls onSaved', async () => {
    const user = userEvent.setup();
    const onSaved = jest.fn();

    renderWithProviders(
      <AddonSelectionPanel flightId="FL-100" passengers={[adult]} onSaved={onSaved} />,
    );

    expect(screen.getByText(/no add-ons selected yet/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /save add-ons/i }));

    expect(screen.getByText(/add-ons saved/i)).toBeInTheDocument();
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(useBookingStore.getState().flightId).toBe('FL-100');
    expect(useBookingStore.getState().addons).toEqual([]);
  });

  it('adds an addon, syncs the booking store, and can remove it from the summary', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AddonSelectionPanel flightId="FL-100" passengers={[adult]} />,
    );

    const priorityHeading = screen.getByText('Priority boarding');
    const priorityCard = priorityHeading.closest('.MuiCard-root');
    expect(priorityCard).toBeTruthy();

    await user.click(within(priorityCard as HTMLElement).getByRole('button', { name: 'Add' }));

    expect(useBookingStore.getState().addons).toEqual([
      { addonId: 'priority-boarding', passengerId: 'adult-1' },
    ]);
    expect(useBookingStore.getState().addonTotal).toBe(18);

    const summary = screen.getByText('Add-ons summary').closest('.MuiCard-root');
    expect(summary).toBeTruthy();
    await user.click(within(summary as HTMLElement).getByRole('button', { name: 'Remove' }));

    expect(useBookingStore.getState().addons).toEqual([]);
    expect(screen.getByText(/no add-ons selected yet/i)).toBeInTheDocument();
  });

  it('hydrates matching stored selections and ignores addons for other passengers', () => {
    act(() => {
      useBookingStore.getState().setAddons({
        flightId: 'FL-100',
        addons: [
          { addonId: 'priority-boarding', passengerId: 'adult-1' },
          { addonId: 'travel-insurance', passengerId: 'missing-passenger' },
        ],
        addonTotal: 50,
      });
    });

    renderWithProviders(
      <AddonSelectionPanel flightId="FL-100" passengers={[adult]} />,
    );

    const summary = screen.getByText('Add-ons summary').closest('.MuiCard-root');
    expect(summary).toBeTruthy();
    expect(within(summary as HTMLElement).getByText('Priority boarding')).toBeInTheDocument();
    expect(within(summary as HTMLElement).queryByText('Travel insurance')).not.toBeInTheDocument();
  });

  it('starts empty when the stored flight id does not match', () => {
    act(() => {
      useBookingStore.getState().setAddons({
        flightId: 'FL-OTHER',
        addons: [{ addonId: 'priority-boarding', passengerId: 'adult-1' }],
        addonTotal: 18,
      });
    });

    renderWithProviders(
      <AddonSelectionPanel flightId="FL-100" passengers={[adult]} />,
    );

    expect(screen.getByText(/no add-ons selected yet/i)).toBeInTheDocument();
  });

  it('shows a validation error for incompatible stored selections and can dismiss it', async () => {
    const user = userEvent.setup();
    const onSaved = jest.fn();

    act(() => {
      useBookingStore.getState().setAddons({
        flightId: 'FL-100',
        addons: [{ addonId: 'lounge-access', passengerId: 'infant-1' }],
        addonTotal: 55,
      });
    });

    renderWithProviders(
      <AddonSelectionPanel flightId="FL-100" passengers={[infant]} onSaved={onSaved} />,
    );

    await user.click(screen.getByRole('button', { name: /save add-ons/i }));

    expect(screen.getByText(/check add-ons/i)).toBeInTheDocument();
    expect(
      screen.getByText(/lounge access cannot be assigned to baby lovelace/i),
    ).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByText(/check add-ons/i)).not.toBeInTheDocument();
  });

  it('dismisses the success alert after a valid save', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AddonSelectionPanel flightId="FL-100" passengers={[adult]} />,
    );

    await user.click(screen.getByRole('button', { name: /save add-ons/i }));
    expect(screen.getByText(/add-ons saved/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByText(/add-ons saved/i)).not.toBeInTheDocument();
  });
});
