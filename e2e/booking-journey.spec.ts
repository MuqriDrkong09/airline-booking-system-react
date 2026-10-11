import { expect, test } from '@playwright/test';
import { loginAsCustomer } from './helpers/auth';
import {
  applyPromoCode,
  cancelBookingFromMyBookings,
  completeBookingThroughConfirmation,
  completeCheckIn,
  completeMockPayment,
  continueToPayment,
  fillAdultPassenger,
  openCheckInWindowForBooking,
  openSearchResults,
  savePassengers,
  selectAvailableSeat,
  selectBaggage,
  selectFirstFlight,
  selectMeal,
  skipAddons,
} from './helpers/booking';

test.describe.configure({ mode: 'serial' });

test.describe('Customer booking journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('5–12. Select flight through confirmation', async ({ page }) => {
    await openSearchResults(page);
    await selectFirstFlight(page);

    await fillAdultPassenger(page, { lastName: 'Traveler' });
    await savePassengers(page);

    await selectAvailableSeat(page);
    await selectBaggage(page);
    await selectMeal(page);
    await skipAddons(page);

    await applyPromoCode(page, 'FLIGHT100');
    await continueToPayment(page);
    await completeMockPayment(page);

    await expect(
      page.getByText(/Your payment was successful|payment was successful/i),
    ).toBeVisible();
    await expect(
      page
        .getByRole('link', { name: 'View booking' })
        .or(page.getByRole('button', { name: 'View booking' })),
    ).toBeVisible();

    const reference = decodeURIComponent(
      page.url().match(/\/bookings\/([^/]+)\/confirmation/)?.[1] ?? '',
    );
    expect(reference).toMatch(/^[A-Z0-9-]+$/i);
  });

  test('13. View booking', async ({ page }) => {
    const { reference } = await completeBookingThroughConfirmation(page, {
      lastName: 'Traveler',
    });

    await page
      .getByRole('link', { name: 'View booking' })
      .or(page.getByRole('button', { name: 'View booking' }))
      .click();

    await expect(page).toHaveURL(new RegExp(`/app/bookings/${reference}`));
    await expect(page.getByRole('heading', { name: 'Booking details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: reference, exact: true })).toBeVisible();
    await expect(page.getByText(/Alex Traveler|Traveler/i).first()).toBeVisible();
  });

  test('14. Cancel booking', async ({ page }) => {
    const { reference } = await completeBookingThroughConfirmation(page, {
      lastName: 'Traveler',
    });

    await cancelBookingFromMyBookings(page, reference);

    await page.goto('/app/bookings');
    await page.getByRole('tab', { name: /Cancelled/i }).click();
    await expect(page.getByText(reference)).toBeVisible({ timeout: 15_000 });
  });

  test('15. Check-in', async ({ page }) => {
    const { reference } = await completeBookingThroughConfirmation(page, {
      lastName: 'Traveler',
    });

    await openCheckInWindowForBooking(page, reference);
    await completeCheckIn(page, { reference, lastName: 'Traveler' });

    await page
      .getByRole('link', { name: 'View booking' })
      .or(page.getByRole('button', { name: 'View booking' }))
      .click();
    await expect(page.getByText(/Checked in|CHECKED_IN/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
