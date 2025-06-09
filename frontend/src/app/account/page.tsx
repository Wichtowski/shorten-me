'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/components/context/UserContext';
import { useRouter } from 'next/navigation';

interface Url {
  id: string;
  original_url: string;
  short_url: string;
  clicks: number;
  created_at: string;
}

export default function MyUrlsPage() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter();

  const fetchUrls = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);

      if (!token) {
        throw new Error('No token found');
      }

      console.log('Making API request to /api/v1/urls');
      const response = await fetch('/api/v1/urls', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch URLs');
      }

      if (!data.urls) {
        console.log('No urls array in response');
        setUrls([]);
      } else {
        console.log('Setting URLs:', data.urls);
        setUrls(data.urls);
      }
    } catch (err) {
      console.error('Error in fetchUrls:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch URLs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (urlId: string) => {
    if (!window.confirm('Are you sure you want to delete this URL? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(urlId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('/api/v1/shorten', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url_id: urlId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete URL');
      }

      // Remove the deleted URL from the state
      setUrls(urls.filter(url => url.id !== urlId));
    } catch (err) {
      console.error('Error deleting URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete URL');
    } finally {
      setDeleteLoading(null);
    }
  };

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      router.push('/login');
      return;
    }

    // Initial fetch
    fetchUrls();

    // Set up periodic refresh every 5 seconds
    const refreshInterval = setInterval(fetchUrls, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        <div className="text-center text-primary-lightest">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <h1 className="text-3xl font-bold text-primary-lightest mb-8">My URLs</h1>
      {urls.length === 0 ? (
        <div className="text-center text-primary-lightest">No URLs found</div>
      ) : (
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
              {urls.map((url) => (
                <tr key={url.id} className="border-b border-primary-light/20 last:border-0">
                  <td className="px-6 py-4 text-primary-lightest">
                    <a
                      href={url.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary-light transition-colors"
                    >
                      {url.original_url}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-primary-lightest">
                    <a
                      href={`/${url.short_url}`}
                      rel="noopener noreferrer"
                      className="hover:text-primary-light transition-colors"
                    >
                      {url.short_url}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-primary-lightest">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light/20 text-primary-lightest">
                      {url.clicks} clicks
                    </span>
                  </td>
                  <td className="px-6 py-4 text-primary-lightest">
                    {new Date(url.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-primary-lightest">
                    <button
                      onClick={() => handleDelete(url.id)}
                      disabled={deleteLoading === url.id}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${deleteLoading === url.id
                          ? 'bg-red-500/50 cursor-not-allowed'
                          : 'bg-red-500 hover:bg-red-600'
                        }`}
                    >
                      {deleteLoading === url.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 