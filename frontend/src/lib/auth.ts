import type { User } from '@common/interfaces/User';

export interface JwtUserPayload {
  user_id: string;
  email: string;
  username: string;
  exp?: number;
  iat?: number;
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded = padding ? `${normalized}${'='.repeat(4 - padding)}` : normalized;
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeJwtPayload(token: string): JwtUserPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(parts[1])) as JwtUserPayload;
  } catch {
    return null;
  }
}

export function tokenToUser(token: string): User | null {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return {
    id: payload.user_id,
    email: payload.email,
    username: payload.username,
  };
}
