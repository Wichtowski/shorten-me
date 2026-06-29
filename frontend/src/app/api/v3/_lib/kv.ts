import { randomSlug, normalizeSlug, isValidCustomSlug } from './slug';
import { AuthTokenPayload, StoredUrl, StoredUser, V3Env } from './types';

const URL_PREFIX = 'v3:url:';
const SLUG_PREFIX = 'v3:slug:';
const USER_PREFIX = 'v3:user:';
const USER_EMAIL_PREFIX = 'v3:user-email:';
const USERNAME_PREFIX = 'v3:username:';
const USER_URLS_PREFIX = 'v3:user-urls:';

function userKey(userId: string): string {
  return `${USER_PREFIX}${userId}`;
}

function emailKey(email: string): string {
  return `${USER_EMAIL_PREFIX}${email.toLowerCase()}`;
}

function usernameKey(username: string): string {
  return `${USERNAME_PREFIX}${username.toLowerCase()}`;
}

function userUrlsKey(userId: string): string {
  return `${USER_URLS_PREFIX}${userId}`;
}

function urlKey(id: string): string {
  return `${URL_PREFIX}${id}`;
}

function slugKey(slug: string): string {
  return `${SLUG_PREFIX}${slug}`;
}

async function getJson<T>(env: V3Env, key: string): Promise<T | null> {
  const value = await env.SHORTENME_KV.get(key);
  return value ? (JSON.parse(value) as T) : null;
}

async function putJson(env: V3Env, key: string, value: unknown): Promise<void> {
  await env.SHORTENME_KV.put(key, JSON.stringify(value));
}

async function deleteKey(env: V3Env, key: string): Promise<void> {
  await env.SHORTENME_KV.delete(key);
}

async function getUserUrlIds(env: V3Env, userId: string): Promise<string[]> {
  return (await getJson<string[]>(env, userUrlsKey(userId))) || [];
}

async function setUserUrlIds(env: V3Env, userId: string, ids: string[]): Promise<void> {
  await putJson(env, userUrlsKey(userId), ids);
}

export async function getUserByEmail(env: V3Env, email: string): Promise<StoredUser | null> {
  const userId = await env.SHORTENME_KV.get(emailKey(email));
  if (!userId) {
    return null;
  }

  return getJson<StoredUser>(env, userKey(userId));
}

export async function getUserById(env: V3Env, userId: string): Promise<StoredUser | null> {
  return getJson<StoredUser>(env, userKey(userId));
}

export async function getUserByUsername(env: V3Env, username: string): Promise<StoredUser | null> {
  const userId = await env.SHORTENME_KV.get(usernameKey(username));
  if (!userId) {
    return null;
  }

  return getJson<StoredUser>(env, userKey(userId));
}

export async function createUserRecord(
  env: V3Env,
  input: { email: string; username: string; passwordHash: string }
): Promise<StoredUser> {
  const email = input.email.trim().toLowerCase();
  const username = input.username.trim();

  if (!email || !username) {
    throw new Error('Missing fields');
  }

  const existingEmailUser = await getUserByEmail(env, email);
  if (existingEmailUser) {
    throw new Error('Email already exists');
  }

  const existingUsernameUser = await getUserByUsername(env, username);
  if (existingUsernameUser) {
    throw new Error('Username already exists');
  }

  const userId = crypto.randomUUID();
  const user: StoredUser = {
    id: userId,
    username,
    email,
    password_hash: input.passwordHash,
    created_at: new Date().toISOString(),
  };

  await putJson(env, userKey(userId), user);
  await env.SHORTENME_KV.put(emailKey(email), userId);
  await env.SHORTENME_KV.put(usernameKey(username), userId);
  return user;
}

export async function deleteUserRecord(env: V3Env, userId: string): Promise<void> {
  const user = await getUserById(env, userId);
  if (!user) {
    return;
  }

  await deleteKey(env, userKey(userId));
  await deleteKey(env, emailKey(user.email));
  await deleteKey(env, usernameKey(user.username));
  await deleteKey(env, userUrlsKey(userId));
}

export async function deleteAllUrlsForUser(env: V3Env, userId: string): Promise<void> {
  const urls = await listUrlsForUser(env, userId);

  for (const url of urls) {
    await deleteKey(env, urlKey(url.id));
    await deleteKey(env, slugKey(url.short_url));
  }

  await deleteKey(env, userUrlsKey(userId));
}

async function loadUrl(env: V3Env, id: string): Promise<StoredUrl | null> {
  return getJson<StoredUrl>(env, urlKey(id));
}

async function saveUrl(env: V3Env, url: StoredUrl): Promise<void> {
  await putJson(env, urlKey(url.id), url);
  await env.SHORTENME_KV.put(slugKey(url.short_url), url.id);
}

async function appendUrlToUser(env: V3Env, userId: string, urlId: string): Promise<void> {
  if (userId === 'anonymous') {
    return;
  }

  const ids = await getUserUrlIds(env, userId);
  if (!ids.includes(urlId)) {
    ids.unshift(urlId);
    await setUserUrlIds(env, userId, ids);
  }
}

function normalizeShortenDraft(draft: {
  original_url?: string;
  originalUrl?: string;
  short_url?: string;
  shortUrl?: string;
  custom_slug?: string;
  customSlug?: string;
}): { original_url?: string; short_url?: string; custom_slug?: string } {
  return {
    original_url: draft.original_url || draft.originalUrl,
    short_url: draft.short_url || draft.shortUrl,
    custom_slug: draft.custom_slug || draft.customSlug,
  };
}

export async function listUrlsForUser(env: V3Env, userId: string): Promise<StoredUrl[]> {
  const ids = await getUserUrlIds(env, userId);
  const urls = await Promise.all(ids.map(async (id) => loadUrl(env, id)));
  return urls
    .filter((url): url is StoredUrl => Boolean(url))
    .sort((left, right) => right.created_at.localeCompare(left.created_at));
}

export async function createUrlRecord(
  env: V3Env,
  input: {
    originalUrl: string;
    userId: string;
    customSlug?: string;
  }
): Promise<StoredUrl> {
  const originalUrl = input.originalUrl.trim();
  if (!originalUrl) {
    throw new Error('Missing original_url');
  }

  const parsedUrl = new URL(originalUrl);
  if (parsedUrl.protocol !== 'https:') {
    throw new Error('Only HTTPS URLs are allowed');
  }

  const slugCandidate = input.customSlug?.trim() || randomSlug();
  if (input.customSlug && !isValidCustomSlug(input.customSlug.trim())) {
    throw new Error('Invalid custom slug');
  }

  const normalizedSlug = normalizeSlug(slugCandidate);
  const existingId = await env.SHORTENME_KV.get(slugKey(normalizedSlug));
  if (existingId) {
    throw new Error('custom_slug already exists');
  }

  const url: StoredUrl = {
    id: crypto.randomUUID(),
    user_id: input.userId,
    original_url: originalUrl,
    short_url: normalizedSlug,
    clicks: 0,
    created_at: new Date().toISOString(),
  };

  await saveUrl(env, url);
  await appendUrlToUser(env, input.userId, url.id);
  return url;
}

export async function findUrlBySlug(env: V3Env, slug: string): Promise<StoredUrl | null> {
  const normalizedSlug = normalizeSlug(slug);
  const urlId = await env.SHORTENME_KV.get(slugKey(normalizedSlug));
  if (!urlId) {
    return null;
  }

  return loadUrl(env, urlId);
}

export async function findUrlById(env: V3Env, urlId: string): Promise<StoredUrl | null> {
  return loadUrl(env, urlId);
}

export async function incrementUrlClicks(env: V3Env, url: StoredUrl): Promise<StoredUrl> {
  const updated = {
    ...url,
    clicks: url.clicks + 1,
  };

  await saveUrl(env, updated);
  return updated;
}

export async function deleteUrlRecord(env: V3Env, urlId: string, userId: string): Promise<void> {
  const url = await loadUrl(env, urlId);
  if (!url || url.user_id !== userId) {
    throw new Error('URL not found or unauthorized');
  }

  const ids = await getUserUrlIds(env, userId);
  await setUserUrlIds(
    env,
    userId,
    ids.filter((id) => id !== urlId)
  );

  await deleteKey(env, urlKey(urlId));
  await deleteKey(env, slugKey(url.short_url));
}

export async function resolveAuthToken(
  env: V3Env,
  authHeader: string | null
): Promise<AuthTokenPayload | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length);
  const { verifyJwt } = await import('./jwt');

  try {
    return await verifyJwt(token, env);
  } catch {
    return null;
  }
}

export async function migrateShortensToUser(
  env: V3Env,
  userId: string,
  shortens: ReturnType<typeof normalizeShortenDraft>[]
): Promise<StoredUrl[]> {
  const migrated: StoredUrl[] = [];

  for (const draft of shortens) {
    const originalUrl = draft.original_url?.trim();
    const shortUrl = draft.short_url?.trim();

    if (!originalUrl || !shortUrl) {
      continue;
    }

    const existing = await findUrlBySlug(env, shortUrl);
    if (existing) {
      if (existing.user_id !== 'anonymous' && existing.user_id !== userId) {
        throw new Error('custom_slug already exists');
      }

      const updated = {
        ...existing,
        user_id: userId,
      };
      await saveUrl(env, updated);
      await appendUrlToUser(env, userId, updated.id);
      migrated.push(updated);
      continue;
    }

    const created = await createUrlRecord(env, {
      originalUrl,
      userId,
      customSlug: shortUrl,
    });
    migrated.push(created);
  }

  return migrated;
}

export function normalizeShortenDraftInput(
  draft: {
    original_url?: string;
    originalUrl?: string;
    short_url?: string;
    shortUrl?: string;
    custom_slug?: string;
    customSlug?: string;
  }
): { original_url?: string; short_url?: string; custom_slug?: string } {
  return normalizeShortenDraft(draft);
}
