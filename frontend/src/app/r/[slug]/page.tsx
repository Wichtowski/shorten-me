'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUrl = async () => {
      if (!params?.slug) return;

      try {
        const response = await fetch(`/api/v1/urls/${params.slug}`);
        if (!response.ok) {
          throw new Error('URL not found');
        }

        const data = await response.json();
        if (data.original_url) {
          // Increment clicks before redirecting
          await fetch(`/api/v1/urls/${params.slug}/clicks`, {
            method: 'POST',
          });

          window.location.href = data.original_url;
        } else {
          throw new Error('Invalid URL data');
        }
      } catch (error) {
        console.error('Error fetching URL:', error);
        setError('URL not found or invalid');
        setTimeout(() => router.push('/'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrl();
  }, [params?.slug, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  return null;
} 