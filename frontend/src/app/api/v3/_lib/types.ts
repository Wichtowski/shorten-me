import { Url } from '@shared/url';

export interface V3Env {
  SHORTENME_KV: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
  };
  JWT_SECRET?: string;
}

export interface AuthTokenPayload {
  user_id: string;
  email: string;
  username: string;
  exp?: number;
  iat?: number;
}

export interface StoredUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface ShortenInput {
  original_url: string;
  short_url: string;
}

export interface ShortenDraft {
  original_url?: string;
  originalUrl?: string;
  short_url?: string;
  shortUrl?: string;
  custom_slug?: string;
  customSlug?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
  };
  token: string;
}

export interface MigrateInput {
  shortens: ShortenDraft[];
}

export type StoredUrl = Url;
