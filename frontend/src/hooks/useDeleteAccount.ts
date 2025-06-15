import { useUser } from '@/components/context/UserContext';
import { useRouter } from 'next/navigation';

export function useDeleteAccount() {
  const { logout } = useUser();
  const router = useRouter();

  const deleteAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await fetch('/api/v2/account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete account');
    }

    logout();
    router.push('/');
  };

  return { deleteAccount };
}
