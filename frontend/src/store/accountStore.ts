import { create } from 'zustand';
import { Url } from '@/types/url';

interface AccountState {
  urls: Url[];
  loading: boolean;
  error: string | null;
  deleteLoading: string | null;
  setUrls: (urls: Url[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDeleteLoading: (id: string | null) => void;
  addUrl: (url: Url) => void;
  removeUrl: (id: string) => void;
  updateUrl: (id: string, updates: Partial<Url>) => void;
  syncUrls: () => Promise<void>;
}

const hasDataChanged = (localUrls: Url[], serverUrls: Url[]): boolean => {
  if (localUrls.length !== serverUrls.length) return true;

  const localMap = new Map(localUrls.map((url) => [url.id, url]));

  for (const serverUrl of serverUrls) {
    const localUrl = localMap.get(serverUrl.id);
    if (!localUrl) return true;

    // Compare relevant fields
    if (
      localUrl.clicks !== serverUrl.clicks ||
      localUrl.original_url !== serverUrl.original_url ||
      localUrl.short_url !== serverUrl.short_url
    ) {
      return true;
    }
  }

  return false;
};

export const useAccountStore = create<AccountState>((set, get) => ({
  urls: [],
  loading: false,
  error: null,
  deleteLoading: null,
  setUrls: (urls) => set({ urls }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setDeleteLoading: (id) => set({ deleteLoading: id }),
  addUrl: (url) => set((state) => ({ urls: [url, ...state.urls] })),
  removeUrl: (id) => set((state) => ({ urls: state.urls.filter((url) => url.id !== id) })),
  updateUrl: (id, updates) =>
    set((state) => ({
      urls: state.urls.map((url) => (url.id === id ? { ...url, ...updates } : url)),
    })),
  syncUrls: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      set({ loading: true, error: null });
      const response = await fetch('/api/v1/urls', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch URLs');
      }

      const data = await response.json();

      // Check if data has changed
      if (hasDataChanged(get().urls, data.urls)) {
        set({ urls: data.urls });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to sync URLs' });
    } finally {
      set({ loading: false });
    }
  },
}));
