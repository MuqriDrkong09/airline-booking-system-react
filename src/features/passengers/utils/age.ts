/**
 * Calendar / age helpers for passenger validation (travel-date aware).
 */

export function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function parseIsoDate(value: string): Date | null {
  if (!isValidCalendarDate(value)) {
    return null;
  }
  const [yearText, monthText, dayText] = value.split('-');
  return new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)));
}

/** Whole years completed between DOB and the reference date (usually departure). */
export function getAgeInYears(dateOfBirth: string, referenceDate = new Date()): number {
  const birth = parseIsoDate(dateOfBirth);
  if (!birth) {
    return Number.NaN;
  }

  const reference =
    referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime())
      ? new Date(
          Date.UTC(
            referenceDate.getUTCFullYear(),
            referenceDate.getUTCMonth(),
            referenceDate.getUTCDate(),
          ),
        )
      : new Date();

  // When reference is an ISO date string path, callers pass Date from departure.
  let age = reference.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = reference.getUTCMonth() - birth.getUTCMonth();
  const dayDiff = reference.getUTCDate() - birth.getUTCDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

export function getAgeOnDeparture(dateOfBirth: string, departureDate: string): number {
  const departure = parseIsoDate(departureDate);
  if (!departure) {
    return getAgeInYears(dateOfBirth);
  }
  return getAgeInYears(dateOfBirth, departure);
}

export function addMonthsToIsoDate(isoDate: string, months: number): string | null {
  const date = parseIsoDate(isoDate);
  if (!date) {
    return null;
  }
  date.setUTCMonth(date.getUTCMonth() + months);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function isDateOnOrAfter(value: string, minimum: string): boolean {
  const left = parseIsoDate(value);
  const right = parseIsoDate(minimum);
  if (!left || !right) {
    return false;
  }
  return left.getTime() >= right.getTime();
}

export function countPhoneDigits(phone: string): number {
  return phone.replace(/\D/g, '').length;
}

export function todayIsoDate(today = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-${pad(today.getUTCDate())}`;
}
