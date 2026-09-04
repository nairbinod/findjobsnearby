// Texas metros covered by statewide SEO scaffolding (PRD §6, §10).
// Launch metro is Dallas-Fort Worth; other metros get thin programmatic
// pages now so the URL structure and indexation are in place before
// go-to-market expands city by city.
export const DFW_METRO_CITIES = [
  "Dallas",
  "Fort Worth",
  "Arlington",
  "Plano",
  "Irving",
  "Garland",
  "McKinney",
  "Frisco",
  "Denton",
  "Grand Prairie",
] as const;

const OTHER_TX_METROS = [
  "Houston",
  "Austin",
  "San Antonio",
  "El Paso",
  "Corpus Christi",
  "Lubbock",
  "Waco",
] as const;

export const TX_METROS = [...DFW_METRO_CITIES, ...OTHER_TX_METROS] as const;

function kebab(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function citySlug(city: string, state: string) {
  return `${kebab(city)}-${state.toLowerCase()}`;
}

const METRO_BY_SLUG = new Map(TX_METROS.map((city) => [citySlug(city, "TX"), city]));

/** Resolves a URL city segment to a display name. Known metros keep correct
 * casing (e.g. "McKinney"); anything else falls back to a title-cased guess
 * so employer-entered cities outside the curated metro list still route. */
export function parseCitySlug(slug: string): { city: string; state: string } | null {
  const known = METRO_BY_SLUG.get(slug);
  if (known) return { city: known, state: "TX" };

  const match = slug.match(/^(.+)-([a-z]{2})$/);
  if (!match) return null;
  const [, cityPart, statePart] = match;
  const city = cityPart
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return { city, state: statePart.toUpperCase() };
}

export const CATEGORIES = ["Food & hospitality", "Skilled trades", "Care & education", "Operations"] as const;

const CATEGORY_SLUGS: Record<(typeof CATEGORIES)[number], string> = {
  "Food & hospitality": "food-hospitality",
  "Skilled trades": "skilled-trades",
  "Care & education": "care-education",
  Operations: "operations",
};

const CATEGORY_BY_SLUG = new Map(Object.entries(CATEGORY_SLUGS).map(([name, slug]) => [slug, name]));

export function categorySlug(category: string) {
  return CATEGORY_SLUGS[category as (typeof CATEGORIES)[number]] ?? kebab(category);
}

export function parseCategorySlug(slug: string) {
  return CATEGORY_BY_SLUG.get(slug);
}

/** Pure, client-safe slug builder — no data fetching, so it can be reused
 * from client components (e.g. the employer dashboard's job links). */
export function buildJobHref(id: string, title: string, city: string, state: string) {
  const isDemo = id.startsWith("demo-");
  const slug = isDemo ? id : `${kebab(title)}-${id}`;
  return `/jobs/${citySlug(city, state)}/${slug}`;
}
