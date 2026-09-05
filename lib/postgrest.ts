/** PostgREST embeds a to-one relation as a single object, not a one-item
 * array -- but Supabase's own generated types (and easy-to-write manual
 * ones) often assume an array, since a to-many embed genuinely is one. Code
 * written against the array assumption silently gets `undefined` back from
 * `[0]` on a real response, with every dependent field quietly falling back
 * to its placeholder instead of erroring. This normalizes either shape. */
export function unwrapEmbed<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
