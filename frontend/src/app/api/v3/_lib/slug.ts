export function randomSlug(length = 7): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let index = 0; index < length; index += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

export function normalizeSlug(value: string): string {
  return value.trim();
}

export function isValidCustomSlug(slug: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(slug);
}
