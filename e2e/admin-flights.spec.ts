import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';
import { toDateTimeLocal, addDays } from './helpers/dates';
import { chooseSelectOption } from './helpers/forms';

test.describe('Admin flights', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/flights');
    await expect(page.getByRole('heading', { name: 'Flights' })).toBeVisible();
  });

  test('17. Admin creates flight', async ({ page }) => {
    const flightNumber = `MH${String(Date.now()).slice(-4)}`;
    const departure = toDateTimeLocal(addDays(new Date(), 30));
    const arrivalDate = addDays(new Date(), 30);
    arrivalDate.setHours(arrivalDate.getHours() + 2);
    const arrival = toDateTimeLocal(arrivalDate);

    await page.getByRole('button', { name: 'Create flight' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Create flight' })).toBeVisible();

    await chooseSelectOption(page, /^Airline$/i, /MH · Malaysia Airlines/i);
    await dialog.getByPlaceholder('MH123').fill(flightNumber);
    await chooseSelectOption(page, /^Origin$/i, /KUL · Kuala Lumpur/i);
    await chooseSelectOption(page, /^Destination$/i, /SIN · Singapore/i);
    await chooseSelectOption(page, /^Aircraft$/i, /Airbus A320/i);
    await dialog.getByLabel(/Departure/i).fill(departure);
    await dialog.getByLabel(/Arrival/i).fill(arrival);
    await dialog.getByPlaceholder('T1').fill('T1');
    await dialog.getByPlaceholder('A12').fill('C9');

    await dialog.getByRole('button', { name: 'Create flight' }).click();
    await expect(page.getByText(flightNumber)).toBeVisible({ timeout: 15_000 });
  });

  test('18. Admin edits flight', async ({ page }) => {
    await expect(page.getByText('MH1')).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: 'Edit MH1' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: /Edit MH1/i })).toBeVisible();

    await dialog.getByPlaceholder('A12').fill('Z99');
    await dialog.getByRole('button', { name: 'Save changes' }).click();

    await expect(dialog).toBeHidden({ timeout: 15_000 });
    await expect(page.getByText('Z99')).toBeVisible({ timeout: 15_000 });
  });
});
