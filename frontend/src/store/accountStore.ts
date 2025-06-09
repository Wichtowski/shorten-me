import { create } from 'zustand';
import type { StateCreator } from 'zustand';

interface Url {
    id: string;
    original_url: string;
    short_url: string;
    clicks: number;
    created_at: string;
}

interface AccountStore {
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
}

export const useAccountStore = create<AccountStore>((set) => ({
    urls: [],
    loading: false,
    error: null,
    deleteLoading: null,
    setUrls: (urls: Url[]) => set({ urls }),
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: string | null) => set({ error }),
    setDeleteLoading: (id: string | null) => set({ deleteLoading: id }),
    addUrl: (url: Url) => set((state: AccountStore) => ({ urls: [...state.urls, url] })),
    removeUrl: (id: string) => set((state: AccountStore) => ({ urls: state.urls.filter((url: Url) => url.id !== id) })),
    updateUrl: (id: string, updates: Partial<Url>) =>
        set((state: AccountStore) => ({
            urls: state.urls.map((url: Url) =>
                url.id === id ? { ...url, ...updates } : url
            ),
        })),
})); 
