"use client";

import React, { useState } from "react";
import {
  canShortenMore,
  incrementShortenCount
} from "@utils/urlUtils";
import { useNotification } from "@components/context/NotificationContext";
import { useUser } from "@components/context/UserContext";
import { useRecentShortens } from "@hooks/useRecentShortens";
import { apiClient } from "@lib/api-client";
import { UrlDetails } from "./UrlDetails";
import { UrlParameters } from "./UrlParameters";
import { RecentShortens } from "./RecentShortens";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FiActivity, FiBarChart2, FiShield } from "react-icons/fi";

export const UrlShortener = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showNotification } = useNotification();
  const { user } = useUser();
  const { addShorten } = useRecentShortens();

  const validateUrl = async (urlString: string) => {
    try {
      const url = new URL(urlString);
      if (url.protocol !== "https:") {
        throw new Error("Only HTTPS URLs are allowed");
      }
      return true;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Invalid URL");
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!canShortenMore()) {
      showNotification(
        "You have reached the maximum number of URL shortenings (3). Please sign up to continue.",
        "info"
      );
      setLoading(false);
      return;
    }

    if (!(await validateUrl(url))) {
      setLoading(false);
      return;
    }

      try {
      const token = localStorage.getItem("token");
      const response = await apiClient.shortenUrl(
        {
          originalUrl: url
        },
        token || undefined
      );
      const generatedShortUrl = response.url.short_url;
      setShortUrl(generatedShortUrl);
      // Add to recent shortenings immediately after shortening
      addShorten(url, generatedShortUrl);
      incrementShortenCount();
      showNotification("URL shortened successfully!", "success");
    } catch (error) {
      console.error("Error shortening URL:", error);
      setError(error instanceof Error ? error.message : "Failed to shorten URL");
      showNotification("Failed to shorten URL", "error");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="space-y-8">
        <form onSubmit={handleSubmit} id="shorten" className="space-y-4">
          <div className="group relative mx-auto max-w-2xl">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-300/20 to-cyan-100/20 opacity-30 blur transition duration-700 group-focus-within:opacity-100" />
            <div className="surface relative flex flex-col gap-3 rounded-xl p-2 shadow-2xl sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="min-w-0 flex-1 border-none bg-transparent py-4 text-base text-slate-100 outline-none placeholder:text-[#849396]/70 focus:ring-0"
                  placeholder="Paste your loooooong URL here..."
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="primary-button shrink-0 px-7 py-4 flex gap-2 items-center justify-center">
                <span>{loading ? "Shortening..." : "Shorten"}</span>
                <FaArrowLeftLong size={18} />
              </button>
            </div>
          </div>

          {error && (
            <p className="mx-auto max-w-2xl rounded-lg border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 text-sm text-[#bac9cc]">
            <p>Only secure HTTPS URLs are accepted</p>
          </div>
        </form>

        <div className="grid gap-6 pt-4 md:grid-cols-3">
          <div className="metric-card text-left">
            <span className="text-cyan-300">
              <FiActivity size={24} aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-bold text-slate-100">Ultra Fast</h3>
            <p className="mt-2 text-sm leading-6 text-[#bac9cc]">
              Paste a link and shorten it in one clean step.
            </p>
          </div>
          <div className="metric-card text-left">
            <span className="text-cyan-300">
              <FiBarChart2 size={24} aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-bold text-slate-100">Real-time Activity</h3>
            <p className="mt-2 text-sm leading-6 text-[#bac9cc]">
              Keep useful links close without hunting through old tabs.
            </p>
          </div>
          <div className="metric-card text-left">
            <span className="text-cyan-300">
              <FiShield size={24} aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-bold text-slate-100">Secure Routing</h3>
            <p className="mt-2 text-sm leading-6 text-[#bac9cc]">
              Signed-in users can manage links and view the data behind them.
            </p>
          </div>
        </div>

        {shortUrl && (
          <div className="space-y-6">
            <UrlDetails shortUrl={shortUrl} originalUrl={url} />
            {user && <UrlParameters originalUrl={url} />}
          </div>
        )}

        <RecentShortens />
      </div>
    </div>
  );
};
