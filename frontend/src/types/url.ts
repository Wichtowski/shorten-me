export interface Url {
  id: string;
  original_url: string;
  short_url: string;
  clicks: number;
  created_at: string;
  user_id: string;
}

// For API responses where user_id might not be included
export type UrlResponse = Omit<Url, 'user_id'>;
