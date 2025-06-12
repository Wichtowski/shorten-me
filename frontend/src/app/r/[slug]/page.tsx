'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/common/Spinner';
import { use } from 'react';

interface PageParams {
  slug: string;
}

export default function RedirectPage({ params }: { params: Promise<PageParams> }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { slug } = use(params);

  useEffect(() => {
    const fetchUrl = async () => {
      if (!slug) {
        console.error('No slug provided');
        setError('Invalid URL');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching URL for slug:', slug);
        const response = await fetch(`/api/v1/urls/${slug}`);
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
          console.error('Error response:', data);
          throw new Error(data.error || 'URL not found');
        }

        if (!data.original_url) {
          console.error('No original_url in response:', data);
          throw new Error('Invalid URL data');
        }

        console.log('Redirecting to:', data.original_url);
        window.location.href = data.original_url;
      } catch (error) {
        console.error('Error fetching URL:', error);
        setError(error instanceof Error ? error.message : 'URL not found or invalid');
        // setTimeout(() => router.push('/'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrl();
  }, [slug, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-500 text-xl font-medium">{error}</div>
        <div className="text-gray-500">Redirecting to home page...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Spinner />
        <div className="text-primary-light">Redirecting...</div>
      </div>
    );
  }

  return null;
}
