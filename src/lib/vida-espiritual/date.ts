const BRAZIL_TZ = "America/Sao_Paulo";

export function getBrazilDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function dateKeyToDbDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export function dbDateToDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
