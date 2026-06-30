declare module "cloudflare:workers" {
  interface KVNamespaceLike {
    get(key: string): Promise<string | null>;
    get<T = unknown>(key: string, options: "json"): Promise<T | null>;
    get(key: string, options: "text"): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
    list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }>;
  }

  export const env: {
    SHORTENME_KV: KVNamespaceLike;
    URLS: KVNamespaceLike;
    JWT_SECRET: string;
    DEPLOY_ENVIRONMENT?: "development" | "production";
    BASIC_AUTH_USERNAME?: string;
    BASIC_AUTH_PASSWORD?: string;
  };
}
