import { useState } from 'react';
import { useAccountStore } from '@/store/accountStore';

export function useDeleteUrl() {
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { removeUrl } = useAccountStore();

  const deleteUrl = async (urlId: string) => {
    setDeleteLoading(urlId);
    setDeleteError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('/api/v2/shorten', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url_id: urlId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete URL');
      }

      removeUrl(urlId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete URL';
      setDeleteError(errorMessage);
      throw err;
    } finally {
      setDeleteLoading(null);
    }
  };

  return { deleteUrl, deleteLoading, deleteError };
}
