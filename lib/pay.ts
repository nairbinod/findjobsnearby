const UNIT_PATTERNS: [RegExp, string][] = [
  [/\/\s*hr|hour/i, "HOUR"],
  [/\/\s*wk|week/i, "WEEK"],
  [/\/\s*mo|month/i, "MONTH"],
  [/\/\s*yr|year|annual/i, "YEAR"],
];

/** Best-effort parse of a free-text pay range (e.g. "$18-22/hr") into a unit
 * and the numbers found. Returns null when the text can't be confidently
 * parsed rather than guessing a unit. */
export function parsePayNumbers(pay: string): { unit: string; numbers: number[] } | null {
  const unit = UNIT_PATTERNS.find(([pattern]) => pattern.test(pay))?.[1];
  if (!unit) return null;

  const numbers = pay.match(/[\d,]+(?:\.\d+)?/g)?.map((n) => Number(n.replace(/,/g, ""))).filter((n) => !Number.isNaN(n));
  if (!numbers || numbers.length === 0) return null;

  return { unit, numbers };
}

/** US-14: pay-range filtering. Only hourly rates are comparable to a
 * "$X+/hr" threshold, so non-hourly pay (weekly/monthly/annual) returns
 * null and is treated as unknown rather than excluded from results. */
export function extractHourlyRate(pay: string): number | null {
  const parsed = parsePayNumbers(pay);
  if (!parsed || parsed.unit !== "HOUR") return null;
  return Math.max(...parsed.numbers);
}
