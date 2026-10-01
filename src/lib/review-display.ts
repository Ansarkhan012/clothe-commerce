// Pure display helpers for review summaries (shared by the product page and tests).

export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;
export type DistributionRow = { stars: 1 | 2 | 3 | 4 | 5; label: string; count: number; percent: number };

export const reviewCountLabel = (count: number) => `${count} ${count === 1 ? "review" : "reviews"}`;
export const starsLabel = (stars: number) => `${stars} ${stars === 1 ? "star" : "stars"}`;

/** Rows from 5 to 1 stars. `count` is what customers read; `percent` only sizes the bar. */
export function ratingDistributionRows(distribution: RatingDistribution, total: number): DistributionRow[] {
  return ([5, 4, 3, 2, 1] as const).map((stars) => {
    const count = Math.max(0, distribution[stars] ?? 0);
    return { stars, label: starsLabel(stars), count, percent: total > 0 ? Math.round((count / total) * 100) : 0 };
  });
}

/** Shortens review text for cards at a word boundary. */
export function excerpt(text: string, max = 180) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}
