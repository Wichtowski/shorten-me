import { useState, useEffect } from 'react';

interface ShortenedUrl {
  originalUrl: string;
  shortUrl: string;
  timestamp: number;
}

const STORAGE_KEY = 'recent_shortens';
const MAX_RECENT_SHORTENS = 5;

export const useRecentShortens = () => {
  const [recentShortens, setRecentShortens] = useState<ShortenedUrl[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRecentShortens(JSON.parse(stored));
    }
  }, []);

  const addShorten = (originalUrl: string, shortUrl: string) => {
    const newShorten: ShortenedUrl = {
      originalUrl,
      shortUrl,
      timestamp: Date.now(),
    };

    setRecentShortens((prev: ShortenedUrl[]) => {
      const updated = [newShorten, ...prev].slice(0, MAX_RECENT_SHORTENS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentShortens = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentShortens([] as ShortenedUrl[]);
  };

  const updateShorten = (index: number, updates: Partial<ShortenedUrl>) => {
    setRecentShortens((prev: ShortenedUrl[]) => {
      const updated = prev.map((item: ShortenedUrl, i: number) =>
        i === index ? { ...item, ...updates, timestamp: Date.now() } : item
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return {
    recentShortens,
    addShorten,
    clearRecentShortens,
    updateShorten,
  };
};
