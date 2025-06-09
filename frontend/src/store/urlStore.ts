import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Url } from '@/types/url';

interface UrlStore {
    urls: Url[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
    setUrls: (urls: Url[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    fetchUrls: () => Promise<void>;
    addUrl: (url: Url) => void;
    removeUrl: (urlId: string) => void;
    clearUrls: () => void;
    updateUrls: (newUrls: Url[]) => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUrlStore = create<UrlStore>()(
    persist(
        (set, get) => ({
            urls: [],
            loading: false,
            error: null,
            lastFetched: null,
            setUrls: (urls) => {
                console.log('Setting URLs:', urls);
                set({ urls: Array.isArray(urls) ? urls : [] });
            },
            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),
            fetchUrls: async () => {
                const { lastFetched, urls } = get();
                const now = Date.now();

                // If we have cached data and it's not expired, don't fetch
                if (lastFetched && urls.length > 0 && now - lastFetched < CACHE_DURATION) {
                    console.log('Using cached URLs data');
                    return;
                }

                const token = localStorage.getItem('token');
                if (!token) return;

                try {
                    set({ loading: true, error: null });
                    const response = await fetch('/api/v1/urls', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch URLs');
                    }

                    const data = await response.json();
                    console.log('Fetched URLs data:', data);

                    const newUrls = Array.isArray(data.urls) ? data.urls : [];
                    const currentUrls = get().urls;

                    // Only update if the data has changed
                    if (JSON.stringify(newUrls) !== JSON.stringify(currentUrls)) {
                        console.log('URLs data has changed, updating store');
                        set({
                            urls: newUrls,
                            lastFetched: now
                        });
                    } else {
                        console.log('URLs data unchanged, keeping current state');
                        set({ lastFetched: now }); // Update timestamp even if data hasn't changed
                    }
                } catch (err) {
                    console.error('Error fetching URLs:', err);
                    set({ error: err instanceof Error ? err.message : 'Failed to fetch URLs' });
                } finally {
                    set({ loading: false });
                }
            },
            addUrl: (url) => set((state) => ({
                urls: [...state.urls, url],
                lastFetched: Date.now()
            })),
            removeUrl: (urlId) => set((state) => ({
                urls: state.urls.filter(url => url.id !== urlId),
                lastFetched: Date.now()
            })),
            clearUrls: () => set({ urls: [], lastFetched: null }),
            updateUrls: (newUrls) => set((state) => ({
                urls: Array.isArray(newUrls) ? newUrls : state.urls,
                lastFetched: Date.now()
            }))
        }),
        {
            name: 'url-storage',
            partialize: (state) => ({
                urls: state.urls,
                lastFetched: state.lastFetched
            })
        }
    )
); 