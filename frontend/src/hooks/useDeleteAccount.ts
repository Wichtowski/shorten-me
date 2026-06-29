import { useUser } from '@components/context/UserContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@lib/api-client';

export function useDeleteAccount() {
  const { logout } = useUser();
  const router = useRouter();

  const deleteAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    await apiClient.deleteAccount(token);

    logout();
    router.push('/');
  };

  return { deleteAccount };
}
