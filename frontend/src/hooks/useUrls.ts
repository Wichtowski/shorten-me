import { useEffect, useCallback } from 'react';
import { useUser } from '@/components/context/UserContext';
import { useAccountStore } from '@/store/accountStore';

export function useUrls() {
  const { user } = useUser();
  const { urls, loading, error, syncUrls } = useAccountStore();

  // Force sync when user explicitly requests it
  const forceSync = useCallback(() => {
    syncUrls();
  }, [syncUrls]);

  useEffect(() => {
    if (user) {
      // Initial fetch
      syncUrls();

      // Set up periodic sync
      const syncInterval = setInterval(() => syncUrls(), 30000);

      return () => clearInterval(syncInterval);
    }
  }, [user, syncUrls]);

  return { urls, loading, error, forceSync };
}
