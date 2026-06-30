"use client";
import { useEffect, useState } from "react";
import { Spinner } from "@components/common/Spinner";
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
      <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="rounded-full border border-rose-300/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200">
          {error}
        </div>
        <div className="text-sm text-slate-300">Redirecting to home page...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center gap-4 px-4">
        <Spinner />
        <div className="text-sm text-slate-300">Redirecting...</div>
      </div>
    );
  }

  return null;
}
