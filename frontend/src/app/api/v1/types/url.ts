import { Url } from '@/types/url';

// For API responses where user_id might not be included
export type UrlResponse = Omit<Url, 'user_id'>;

// For database operations
export type UrlDocument = Url; 