import { useState } from 'react';
import { useAccountStore } from '@store/accountStore';
import { apiClient } from '@lib/api-client';

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

      await apiClient.deleteUrl(urlId, token);

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
