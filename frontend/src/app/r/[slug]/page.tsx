"use client";
import { useEffect, useState } from "react";
import Spinner from "@components/common/Spinner";
import { use } from "react";
import { apiClient } from "@lib/api-client";

interface PageParams {
  slug: string;
}

export default function RedirectPage({ params }: { params: Promise<PageParams> }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { slug } = use(params);

  useEffect(() => {
    const fetchUrl = async () => {
      if (!slug) {
        console.error("No slug provided");
        setError("Invalid URL");
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiClient.resolveShortUrl(slug);
        window.location.href = data.original_url || data.url.original_url;
      } catch (error) {
        console.error("Error fetching URL:", error);
        setError(error instanceof Error ? error.message : "URL not found or invalid");
        // setTimeout(() => router.push('/'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrl();
  }, [slug]);

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
