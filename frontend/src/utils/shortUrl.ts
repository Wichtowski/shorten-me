export function formatShortUrl(slug: string, origin: string = window.location.origin): string {
  return `${origin}/r/${slug}`;
}
