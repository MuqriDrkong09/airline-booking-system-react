/** Format a Date as `YYYY-MM-DD` in local time. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Format a Date as `YYYY-MM-DDTHH:mm` in local time (datetime-local). */
export function toDateTimeLocal(date: Date): string {
  const datePart = toIsoDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${datePart}T${hours}:${minutes}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function futureDepartureDate(daysFromToday = 21): string {
  return toIsoDate(addDays(new Date(), daysFromToday));
}

export function futureReturnDate(daysFromToday = 28): string {
  return toIsoDate(addDays(new Date(), daysFromToday));
}
