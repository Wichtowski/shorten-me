import type { User } from "@common/interfaces/User";
import type { Url } from "@shared/url";

export class ApiClientError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ShortenInput {
  originalUrl: string;
  customSlug?: string;
}

export interface MigrateShortenInput {
  originalUrl?: string;
  original_url?: string;
  shortUrl?: string;
  short_url?: string;
  timestamp?: number;
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? (JSON.parse(text) as T & { error?: string }) : ({} as T);

  if (!response.ok) {
    throw new ApiClientError(
      (data as { error?: string }).error || response.statusText || "Request failed",
      response.status,
      data
    );
  }

  return data;
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const response = await fetch(path, {
    ...init,
    headers
  });

  return readJsonResponse<T>(response);
}

function withAuth(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeShortenInput(shorten: MigrateShortenInput): {
  original_url?: string;
  short_url?: string;
} {
  return {
    original_url: shorten.original_url || shorten.originalUrl,
    short_url: shorten.short_url || shorten.shortUrl
  };
}

export const apiClient = {
  async health(): Promise<{ status: string; version: string }> {
    return requestJson("/api/v3/health");
  },

  async login(input: { email: string; password: string }): Promise<AuthResponse> {
    return requestJson("/api/v3/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });
  },

  async signup(input: {
    email: string;
    username: string;
    password: string;
  }): Promise<AuthResponse> {
    return requestJson("/api/v3/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });
  },

  async shortenUrl(input: ShortenInput, token?: string): Promise<{ url: Url }> {
    return requestJson("/api/v3/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...withAuth(token)
      },
      body: JSON.stringify({
        original_url: input.originalUrl,
        custom_slug: input.customSlug
      })
    });
  },

  async deleteUrl(urlId: string, token: string): Promise<{ message: string }> {
    return requestJson("/api/v3/shorten", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...withAuth(token)
      },
      body: JSON.stringify({ url_id: urlId })
    });
  },

  async getUrls(token: string): Promise<{ urls: Url[] }> {
    return requestJson("/api/v3/urls", {
      headers: {
        ...withAuth(token)
      }
    });
  },

  async deleteAccount(token: string): Promise<{ message: string }> {
    return requestJson("/api/v3/account", {
      method: "DELETE",
      headers: {
        ...withAuth(token)
      }
    });
  },

  async migrateShortens(
    shortens: MigrateShortenInput[],
    token: string
  ): Promise<{ migrated: Url[]; urls: Url[] }> {
    return requestJson("/api/v3/shorten/migrate", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...withAuth(token)
      },
      body: JSON.stringify({
        shortens: shortens.map(normalizeShortenInput)
      })
    });
  },

  async resolveShortUrl(slug: string): Promise<{ url: Url; original_url: string }> {
    return requestJson(`/api/v3/urls/${slug}`);
  }
};
