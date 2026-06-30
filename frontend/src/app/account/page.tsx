'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@components/context/UserContext';
import { useRouter } from 'next/navigation';
import Notification from '@components/common/Notification';
import ConfirmationOverlay from '@components/common/ConfirmationOverlay';
import Spinner from '@components/common/Spinner';
import { useUrls } from '@hooks/useUrls';
import { useDeleteUrl } from '@hooks/useDeleteUrl';
import { UrlTable } from '@components/account/UrlTable';
import { useDeleteAccount } from '@hooks/useDeleteAccount';
import { Url } from '@shared/url';
import { apiClient } from '@lib/api-client';
import { tokenToUser } from '@lib/auth';
import { formatShortUrl } from '@utils/shortUrl';

interface ShortenedUrl {
  originalUrl: string;
  shortUrl: string;
  timestamp: number;
}

export default function MyUrlsPage() {
  const { user, logout } = useUser();
  const router = useRouter();
  const { urls: localUrls = [], error } = useUrls();
  const { deleteUrl, deleteLoading } = useDeleteUrl();
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    urlId: string | null;
  }>({
    isOpen: false,
    urlId: null,
  });
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState<boolean>(false);
  const { deleteAccount } = useDeleteAccount();
  const [syncedUrls, setSyncedUrls] = useState<Url[]>([]);
  const [shouldUseLocal, setShouldUseLocal] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const decoded = tokenToUser(token);
      if (!decoded) {
        router.push('/login');
        return;
      }
    };

    checkAuth();
  }, [user, router]);

  useEffect(() => {
    const syncData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const storedUrls = JSON.parse(localStorage.getItem('urls') || '[]');
      const recentShortens = JSON.parse(localStorage.getItem('recent_shortens') || '[]');

      try {
        const data = await apiClient.getUrls(token);
        const serverUrls = data.urls;

        // MIGRATE IF RECENT SHORTENS ARE NOT IN THE SERVER
        if (recentShortens.length > 0) {
          const missing = recentShortens.filter(
            (r: ShortenedUrl) => !serverUrls.some((u: Url) => u.short_url === r.shortUrl)
          );
          if (missing.length > 0) {
            await apiClient.migrateShortens(missing, token);
            localStorage.removeItem('recent_shortens');
            // Odśwież dane po migracji
            const refreshedData = await apiClient.getUrls(token);
            localStorage.setItem('urls', JSON.stringify(refreshedData.urls));
            setSyncedUrls(refreshedData.urls);
            setShouldUseLocal(false);
            setNotification({
              message: 'Migrated anonymous shortens to your account.',
              type: 'success',
            });
            setIsInitialLoad(false);
            return;
          }
        }

        // Only update if there's a real difference in data
        const isDataMatching =
          storedUrls.length === serverUrls.length &&
          storedUrls.every((storedUrl: Url, index: number) => {
            const serverUrl = serverUrls[index];
            return (
              storedUrl.clicks === serverUrl.clicks &&
              storedUrl.original_url === serverUrl.original_url &&
              storedUrl.short_url === serverUrl.short_url
            );
          });

        if (!isDataMatching) {
          localStorage.setItem('urls', JSON.stringify(serverUrls));
          setSyncedUrls(serverUrls);
          setShouldUseLocal(false);
        }
      } catch (err) {
        console.error('Error syncing URLs:', err);
        setNotification({ message: 'Failed to fetch URLs', type: 'error' });
      } finally {
        setIsInitialLoad(false);
      }
    };

    syncData();
  }, []);

  const handleCopyOriginalUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setNotification({ message: 'Original URL copied to clipboard!', type: 'success' });
  };

  const handleCopyShortUrl = (slug: string) => {
    navigator.clipboard.writeText(formatShortUrl(slug));
    setNotification({ message: 'URL copied to clipboard!', type: 'success' });
  };

  const handleDeleteClick = (urlId: string) => {
    setDeleteConfirmation({ isOpen: true, urlId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.urlId) return;

    try {
      await deleteUrl(deleteConfirmation.urlId);
      setSyncedUrls((urls) => urls.filter((url) => url.id !== deleteConfirmation.urlId));
      setNotification({ message: 'URL deleted successfully', type: 'success' });
    } catch (err) {
      setNotification({
        message: err instanceof Error ? err.message : 'Failed to delete URL',
        type: 'error',
      });
    } finally {
      setDeleteConfirmation({ isOpen: false, urlId: null });
    }
  };

  const handleDeleteAccountClick = () => {
    setDeleteAccountConfirmation(true);
  };

  const handleDeleteAccountConfirm = async () => {
    try {
      await deleteAccount();
      setNotification({ message: 'Account deleted successfully', type: 'success' });
    } catch (err) {
      console.error('Error deleting account:', err);
      setNotification({
        message: err instanceof Error ? err.message : 'Failed to delete account',
        type: 'error',
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return null;

  // Use local URLs by default, only switch to server data if they don't match
  const displayUrls = shouldUseLocal ? localUrls : syncedUrls;

  return (
    <div className="container mx-auto px-4 py-16 mt-16 relative min-h-screen">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <ConfirmationOverlay
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, urlId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete URL"
        message="Are you sure you want to delete this URL? This action cannot be undone."
        confirmText="Delete"
      />
      <ConfirmationOverlay
        isOpen={deleteAccountConfirmation}
        onClose={() => setDeleteAccountConfirmation(false)}
        onConfirm={handleDeleteAccountConfirm}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete"
      />
      <h1 className="text-3xl font-bold text-primary-lightest mb-8">My URLs</h1>
      <div className="overflow-x-auto">
        <table className="w-full bg-primary-dark/50 backdrop-blur-sm rounded-xl border border-primary-light/20">
          <thead>
            <tr className="border-b border-primary-light/20">
              <th className="px-6 py-4 text-left text-primary-lightest">Original URL</th>
              <th className="px-6 py-4 text-left text-primary-lightest">Short URL</th>
              <th className="px-6 py-4 text-left text-primary-lightest">Clicks</th>
              <th className="px-6 py-4 text-primary-lightest">Created At</th>
              <th className="px-6 py-4 text-left text-primary-lightest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isInitialLoad && !localStorage.getItem('urls') ? (
              <tr>
                <td colSpan={5} className="px-6 py-8">
                  <div className="flex justify-center">
                    <Spinner />
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-6 py-4">
                  <div className="text-center text-red-400">{error}</div>
                </td>
              </tr>
            ) : displayUrls.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4">
                  <div className="text-center text-primary-lightest">
                    No URLs found. Start by creating your first short URL!
                  </div>
                </td>
              </tr>
            ) : (
              <UrlTable
                urls={displayUrls}
                onCopyOriginalUrl={handleCopyOriginalUrl}
                onCopyShortUrl={handleCopyShortUrl}
                onDeleteUrl={handleDeleteClick}
                deleteLoading={!!deleteLoading}
              />
            )}
          </tbody>
        </table>
      </div>

      <div className="fixed bottom-8 right-8 bg-primary-dark/50 backdrop-blur-sm rounded-xl border border-primary-light/20 p-4">
        <div className="space-y-4">
          <div className="text-primary-lightest">
            <p className="font-medium">Account</p>
            <p className="text-sm text-primary-light">{user.email}</p>
          </div>
          <div className="space-y-2">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
            <button
              onClick={handleDeleteAccountClick}
              className="w-full bg-black text-white px-4 py-2 rounded-lg cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
