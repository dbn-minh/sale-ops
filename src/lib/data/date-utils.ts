export const DEMO_REFERENCE_DATE = new Date("2026-05-04T12:00:00.000Z");

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HOUR_IN_MS = 60 * 60 * 1000;

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_IN_MS);
}

export function subDays(date: Date, days: number) {
  return addDays(date, -days);
}

export function addBusinessDays(date: Date, days: number) {
  const result = new Date(date.getTime());
  let remaining = days;

  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + 1);

    const day = result.getUTCDay();

    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return result;
}

export function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * HOUR_IN_MS);
}

export function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function toIsoDateTime(date: Date) {
  return date.toISOString();
}
