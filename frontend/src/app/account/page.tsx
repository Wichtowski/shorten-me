'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/components/context/UserContext';
import { useRouter } from 'next/navigation';
import Notification from '@/components/common/Notification';
import ConfirmationOverlay from '@/components/common/ConfirmationOverlay';
import Spinner from '@/components/common/Spinner';
import { verifyJwt } from '../api/v1/utils/jwt';
import { useUrls } from '@/hooks/useUrls';
import { useDeleteUrl } from '@/hooks/useDeleteUrl';
import { UrlTable } from '@/components/account/UrlTable';
import { useDeleteAccount } from '@/hooks/useDeleteAccount';

export default function MyUrlsPage() {
  const { user, logout } = useUser();
  const router = useRouter();
  const { urls = [], loading, error } = useUrls();
  const { deleteUrl, deleteLoading } = useDeleteUrl();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; urlId: string | null }>({
    isOpen: false,
    urlId: null
  });
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState<boolean>(false);
  const { deleteAccount } = useDeleteAccount();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const decoded = await verifyJwt(token);
      if (!decoded) {
        router.push('/login');
        return;
      }
    };

    checkAuth();
  }, [user, router]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setNotification({ message: 'URL copied to clipboard!', type: 'success' });
  };

  const handleDeleteClick = (urlId: string) => {
    setDeleteConfirmation({ isOpen: true, urlId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.urlId) return;

    try {
      await deleteUrl(deleteConfirmation.urlId);
      setNotification({ message: 'URL deleted successfully', type: 'success' });
    } catch (err) {
      setNotification({
        message: err instanceof Error ? err.message : 'Failed to delete URL',
        type: 'error'
      });
    } finally {
      setDeleteConfirmation({ isOpen: false, urlId: null });
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteAccountConfirmation(true);

    try {
      await deleteAccount();
      setNotification({ message: 'Account deleted successfully', type: 'success' });
    } catch (err) {
      setNotification({ message: err instanceof Error ? err.message : 'Failed to delete account', type: 'error' });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return null;

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
        onConfirm={handleDeleteAccount}
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
              <th className="px-6 py-4 text-left text-primary-lightest">Created At</th>
              <th className="px-6 py-4 text-left text-primary-lightest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
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
            ) : urls.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4">
                  <div className="text-center text-primary-lightest">
                    No URLs found. Start by creating your first short URL!
                  </div>
                </td>
              </tr>
            ) : (
              <UrlTable
                urls={urls}
                onCopyUrl={handleCopyUrl}
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
              onClick={handleDeleteAccount}
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