import { useEffect } from 'react';
import { useUser } from '@/components/context/UserContext';
import { useUrlStore } from '@/store/urlStore';

export function useUrls() {
    const { user } = useUser();
    const { urls, loading, error, fetchUrls, updateUrls } = useUrlStore();

    useEffect(() => {
        if (user) {
            console.log('Fetching URLs for user:', user);
            fetchUrls();
        }
    }, [user, fetchUrls]);

    console.log('Current URLs state:', { urls, loading, error });
    return { urls: Array.isArray(urls) ? urls : [], loading, error, updateUrls };
} 