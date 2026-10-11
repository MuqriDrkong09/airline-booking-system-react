import { expect, type Page } from '@playwright/test';
import { futureDepartureDate, futureReturnDate } from './dates';
import { chooseSelectOption, pickAirport } from './forms';

const SUCCESS_CARD = '4111111111111111';

export async function searchOneWayFlights(
  page: Page,
  options: { from?: string; to?: string; departure?: string } = {},
) {
  const from = options.from ?? 'KUL';
  const to = options.to ?? 'NRT';
  const departure = options.departure ?? futureDepartureDate(21);

  await page.goto('/app/flights');
  await expect(page.getByRole('heading', { name: 'Search flights' })).toBeVisible();

  await page.getByRole('button', { name: 'One-way' }).click();
  await pickAirport(
    page,
    /^From/i,
    from,
    new RegExp(`${from} —`, 'i'),
  );
  await pickAirport(page, /^To/i, to, new RegExp(`${to} —`, 'i'));
  await page.getByLabel(/Departure date/i).fill(departure);
  await page.getByRole('button', { name: 'Search flights' }).click();

  await expect(page.getByText(/Available flights/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('button', { name: 'Select' }).first()).toBeVisible();

  return { from, to, departure };
}

export async function searchRoundTripFlights(
  page: Page,
  options: {
    from?: string;
    to?: string;
    departure?: string;
    returnDate?: string;
  } = {},
) {
  const from = options.from ?? 'KUL';
  const to = options.to ?? 'SIN';
  const departure = options.departure ?? futureDepartureDate(21);
  const returnDate = options.returnDate ?? futureReturnDate(28);

  await page.goto('/app/flights');
  await expect(page.getByRole('heading', { name: 'Search flights' })).toBeVisible();

  await page.getByRole('button', { name: 'Round-trip' }).click();
  await pickAirport(page, /^From/i, from, new RegExp(`${from} —`, 'i'));
  await pickAirport(page, /^To/i, to, new RegExp(`${to} —`, 'i'));
  await page.getByLabel(/Departure date/i).fill(departure);
  await page.getByLabel(/Return date/i).fill(returnDate);
  await page.getByRole('button', { name: 'Search flights' }).click();

  await expect(page.getByText(/Available flights/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('button', { name: 'Select' }).first()).toBeVisible();

  return { from, to, departure, returnDate };
}

/** Hydrate search results via URL (faster than typing airports). */
export async function openSearchResults(
  page: Page,
  options: { from?: string; to?: string; departure?: string; returnDate?: string } = {},
) {
  const from = options.from ?? 'KUL';
  const to = options.to ?? 'NRT';
  const departure = options.departure ?? futureDepartureDate(21);
  const params = new URLSearchParams({
    from,
    to,
    departure,
    adults: '1',
    children: '0',
    infants: '0',
    cabin: 'ECONOMY',
  });
  if (options.returnDate) {
    params.set('returnDate', options.returnDate);
  }

  await page.goto(`/app/flights?${params.toString()}`);
  await expect(page.getByText(/Available flights/i)).toBeVisible({ timeout: 20_000 });
  return { from, to, departure, returnDate: options.returnDate };
}

export async function selectFirstFlight(page: Page) {
  await page.getByRole('button', { name: 'Select' }).first().click();
  await expect(page.getByRole('heading', { name: 'Flight details' })).toBeVisible();
  await page.getByRole('button', { name: 'Select Flight' }).click();
  await expect(page.getByRole('heading', { name: 'Passenger details' })).toBeVisible();
}

export async function fillAdultPassenger(
  page: Page,
  options: { firstName?: string; lastName?: string; email?: string } = {},
) {
  const firstName = options.firstName ?? 'Alex';
  const lastName = options.lastName ?? 'Traveler';
  const email = options.email ?? 'alex.e2e@example.com';

  await chooseSelectOption(page, /^Title$/i, 'Mr');
  await page.locator('#passenger-0-first-name').fill(firstName);
  await page.locator('#passenger-0-last-name').fill(lastName);
  await page.locator('#passenger-0-dob').fill('1990-06-15');
  await chooseSelectOption(page, /^Gender$/i, 'Male');
  await chooseSelectOption(page, /^Nationality$/i, 'Malaysia');
  await page.locator('#passenger-0-passport-number').fill('A1234567');
  await page.locator('#passenger-0-passport-expiry').fill('2030-01-01');
  await page.locator('#passenger-0-email').fill(email);
  await page.locator('#passenger-0-phone').fill('+60 12 345 6789');
}

export async function savePassengers(page: Page) {
  await page.getByRole('button', { name: 'Save passengers' }).click();
  await expect(page.getByRole('heading', { name: 'Select seats' })).toBeVisible({
    timeout: 20_000,
  });
}

export async function selectAvailableSeat(page: Page) {
  await expect(page.getByRole('group', { name: /seat map/i })).toBeVisible();
  const seat = page.getByRole('button', { name: /Seat .+Available/i }).first();
  await expect(seat).toBeVisible({ timeout: 20_000 });
  await seat.click();
  await page.getByRole('button', { name: 'Save seat selection' }).click();
  await expect(page.getByRole('heading', { name: 'Baggage', exact: true })).toBeVisible({
    timeout: 20_000,
  });
}

export async function selectBaggage(page: Page) {
  const checkedGroup = page.getByRole('radiogroup', {
    name: /checked baggage/i,
  });
  await checkedGroup.getByRole('radio', { name: /20KG/i }).click();
  await page.getByRole('button', { name: /Save baggage/i }).click();
  await expect(page.getByRole('heading', { name: 'Meals', exact: true })).toBeVisible({
    timeout: 20_000,
  });
}

export async function selectMeal(page: Page) {
  const mealGroup = page.getByRole('radiogroup', { name: /meals/i }).first();
  await mealGroup.getByRole('radio', { name: /Standard Meal/i }).click();
  await page.getByRole('button', { name: /Save meals/i }).click();
  await expect(page.getByRole('heading', { name: 'Add-ons', exact: true })).toBeVisible({
    timeout: 20_000,
  });
}

export async function skipAddons(page: Page) {
  await page.getByRole('button', { name: /Save add-ons/i }).click();
  await expect(
    page.getByRole('heading', { name: 'Booking summary', exact: true }),
  ).toBeVisible({
    timeout: 20_000,
  });
}

export async function applyPromoCode(page: Page, code = 'FLIGHT100') {
  await page.getByLabel(/Promo code|Code/i).fill(code);
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByText(/Promo applied/i)).toBeVisible({ timeout: 15_000 });
}

export async function continueToPayment(page: Page) {
  await page.getByLabel('Confirm booking details before payment').check();
  const continueControl = page
    .getByRole('link', { name: 'Continue to payment' })
    .or(page.getByRole('button', { name: 'Continue to payment' }));
  await continueControl.click();
  await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible({
    timeout: 20_000,
  });
}

export async function completeMockPayment(page: Page) {
  await page.getByLabel(/Card number/i).fill(SUCCESS_CARD);
  await page.getByLabel(/Cardholder name/i).fill('Alex Traveler');
  await page.getByLabel(/Expiry date/i).fill('12/30');
  await page.getByLabel(/^CVV/i).fill('123');
  await page.getByRole('button', { name: /^Pay\s/i }).click();
  await expect(page.getByRole('heading', { name: 'Booking confirmation' })).toBeVisible({
    timeout: 30_000,
  });
}

export async function completeBookingThroughConfirmation(
  page: Page,
  passenger: { firstName?: string; lastName?: string; email?: string } = {},
) {
  await openSearchResults(page);
  await selectFirstFlight(page);
  await fillAdultPassenger(page, passenger);
  await savePassengers(page);
  await selectAvailableSeat(page);
  await selectBaggage(page);
  await selectMeal(page);
  await skipAddons(page);
  await applyPromoCode(page);
  await continueToPayment(page);
  await completeMockPayment(page);

  const referenceMatch = page.url().match(/\/bookings\/([^/]+)\/confirmation/);
  const reference = referenceMatch?.[1] ? decodeURIComponent(referenceMatch[1]) : null;
  expect(reference).toBeTruthy();
  return { reference: reference! };
}

/** Move confirmed booking departure into the online check-in window (within 48h). */
export async function openCheckInWindowForBooking(page: Page, reference: string) {
  await page.evaluate((bookingReference) => {
    const storageKey = 'aerobook-bookings';
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      throw new Error('No aerobook-bookings persistence found');
    }

    const parsed = JSON.parse(raw) as {
      state?: { bookings?: Array<{ reference: string; flight: { departureTime: string; arrivalTime?: string } }> };
      bookings?: Array<{ reference: string; flight: { departureTime: string; arrivalTime?: string } }>;
    };

    const bookings = parsed.state?.bookings ?? parsed.bookings;
    if (!bookings?.length) {
      throw new Error('No bookings in persistence');
    }

    const booking = bookings.find(
      (item) => item.reference.toUpperCase() === bookingReference.toUpperCase(),
    );
    if (!booking) {
      throw new Error(`Booking ${bookingReference} not found in persistence`);
    }

    const departure = new Date();
    departure.setHours(departure.getHours() + 20);
    const arrival = new Date(departure);
    arrival.setHours(arrival.getHours() + 2);

    const pad = (value: number) => String(value).padStart(2, '0');
    const formatLocal = (date: Date) =>
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

    booking.flight.departureTime = formatLocal(departure);
    if (booking.flight.arrivalTime) {
      booking.flight.arrivalTime = formatLocal(arrival);
    }

    localStorage.setItem(storageKey, JSON.stringify(parsed));
  }, reference);

  await page.reload();
}

export async function cancelBookingFromMyBookings(page: Page, reference: string) {
  await page.goto('/app/bookings');
  await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();

  const card = page
    .locator('*')
    .filter({ hasText: reference })
    .filter({ has: page.getByRole('button', { name: 'Cancel' }) })
    .first();

  await expect(card.getByRole('button', { name: 'Cancel' })).toBeVisible({ timeout: 15_000 });
  await card.getByRole('button', { name: 'Cancel' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Cancellation policy' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Continue' }).click();
  await expect(dialog.getByRole('heading', { name: 'Cancellation fee & refund' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Continue' }).click();
  await expect(dialog.getByRole('heading', { name: 'Confirm cancellation' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Confirm cancellation' }).click();
  await expect(dialog.getByRole('heading', { name: 'Cancellation result' })).toBeVisible({
    timeout: 15_000,
  });
  await dialog.getByRole('button', { name: 'Done' }).click();
}

export async function completeCheckIn(
  page: Page,
  options: { reference: string; lastName: string },
) {
  await page.goto(`/app/check-in?reference=${encodeURIComponent(options.reference)}`);
  await expect(page.getByRole('heading', { name: 'Online check-in' })).toBeVisible();

  await page.getByLabel(/Booking reference/i).fill(options.reference);
  await page.getByLabel(/Last name/i).fill(options.lastName);
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByText(/Select passengers/i)).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Continue to seats' }).click();
  await page.getByRole('button', { name: 'Continue to baggage' }).click();
  await page.getByRole('button', { name: 'Continue to confirm' }).click();
  await page.getByRole('button', { name: 'Complete check-in' }).click();

  await expect(page.getByText(/Check-in complete/i)).toBeVisible({ timeout: 15_000 });
}
