import { expect, test } from '@playwright/test';
import { loginAsCustomer } from './helpers/auth';
import { futureDepartureDate } from './helpers/dates';
import { pickAirportById } from './helpers/forms';

test.describe('Multi-city search', () => {
  test('searches a two-leg multi-city itinerary', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/app/flights');
    await expect(page.getByRole('heading', { name: 'Search flights' })).toBeVisible();

    await page.getByRole('button', { name: 'Multi-city' }).click();
    await expect(page.getByText('Flight 1')).toBeVisible();
    await expect(page.getByText('Flight 2')).toBeVisible();

    const leg1Date = futureDepartureDate(21);
    const leg2Date = futureDepartureDate(28);

    await pickAirportById(page, 'flight-leg-0-origin', 'KUL', /KUL —/i);
    await pickAirportById(page, 'flight-leg-0-destination', 'SIN', /SIN —/i);
    await page.locator('#flight-leg-0-departure').fill(leg1Date);

    await pickAirportById(page, 'flight-leg-1-origin', 'SIN', /SIN —/i);
    await pickAirportById(page, 'flight-leg-1-destination', 'NRT', /NRT —/i);
    await page.locator('#flight-leg-1-departure').fill(leg2Date);

    await page.getByRole('button', { name: 'Search flights' }).click();

    await expect(page.getByText(/Available flights/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('button', { name: 'Select' }).first()).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/KUL|SIN|NRT|Multi/i);
  });
});
