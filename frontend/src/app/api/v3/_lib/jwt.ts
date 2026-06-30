import { AuthTokenPayload, V3Env } from './types';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const DEFAULT_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

function getSecret(env?: Partial<V3Env>): string {
  const secret = env?.JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }

  return secret;
}

function base64UrlEncode(value: string): string {
  return btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return base64UrlEncode(binary);
}

function base64UrlEncodeString(value: string): string {
  return base64UrlEncodeBytes(encoder.encode(value));
}

function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const missingPadding = padded.length % 4;
  const decoded = missingPadding ? `${padded}${'='.repeat(4 - missingPadding)}` : padded;
  const binary = atob(decoded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return decoder.decode(bytes);
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function signValue(secret: string, value: string): Promise<string> {
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return base64UrlEncodeBytes(new Uint8Array(signature));
}

export async function signJwt(
  payload: AuthTokenPayload,
  env?: Partial<V3Env>,
  expiresInSeconds: number = DEFAULT_EXPIRES_IN_SECONDS
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const body: AuthTokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const encodedHeader = base64UrlEncodeString(JSON.stringify(header));
  const encodedPayload = base64UrlEncodeString(JSON.stringify(body));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = await signValue(getSecret(env), signingInput);

  return `${signingInput}.${signature}`;
}

export async function verifyJwt(token: string, env?: Partial<V3Env>): Promise<AuthTokenPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const secret = getSecret(env);
  const expectedSignature = await signValue(secret, signingInput);

  if (expectedSignature !== signature) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AuthTokenPayload;
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
}

export function decodeJwtPayload(token: string): AuthTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(parts[1])) as AuthTokenPayload;
  } catch {
    return null;
  }
}
