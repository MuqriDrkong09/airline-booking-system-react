import { expect, test } from '@playwright/test';
import { loginAsCustomer } from './helpers/auth';
import {
  completeBookingThroughConfirmation,
  completeCheckIn,
  openCheckInWindowForBooking,
} from './helpers/booking';

test.describe('Booking documents', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('opens e-ticket and invoice from confirmation', async ({ page }) => {
    const { reference } = await completeBookingThroughConfirmation(page, {
      lastName: 'Traveler',
    });

    await page
      .getByRole('link', { name: 'View e-ticket' })
      .or(page.getByRole('button', { name: 'View e-ticket' }))
      .click();
    await expect(page.getByRole('heading', { name: 'E-ticket', exact: true })).toBeVisible();
    await expect(page.getByText(reference, { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Print e-ticket|Download/i }).first(),
    ).toBeVisible();

    await page.goto(`/app/bookings/${encodeURIComponent(reference)}/invoice`);
    await expect(page.getByRole('heading', { name: 'Invoice', exact: true })).toBeVisible();
    await expect(page.getByText(reference, { exact: true }).first()).toBeVisible();
  });

  test('shows boarding pass after check-in', async ({ page }) => {
    const { reference } = await completeBookingThroughConfirmation(page, {
      lastName: 'Traveler',
    });

    await openCheckInWindowForBooking(page, reference);
    await completeCheckIn(page, { reference, lastName: 'Traveler' });

    await page
      .getByRole('link', { name: 'View boarding pass' })
      .or(page.getByRole('button', { name: 'View boarding pass' }))
      .click();
    await expect(
      page.getByRole('heading', { name: 'Boarding pass', exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByText(reference, { exact: true }).first()).toBeVisible();
  });
});
