"use client";

import { useEffect, useState } from "react";
import { useUser } from "@components/context/UserContext";
import { useRouter } from "next/navigation";
import { Notification } from "@components/common/Notification";
import { ConfirmationOverlay } from "@components/common/ConfirmationOverlay";
import { Spinner } from "@components/common/Spinner";
import { useUrls } from "@hooks/useUrls";
import { useDeleteUrl } from "@hooks/useDeleteUrl";
import { useDeleteAccount } from "@hooks/useDeleteAccount";
import { Url } from "@shared/url";
import { apiClient } from "@lib/api-client";
import { tokenToUser } from "@lib/auth";
import { formatShortUrl } from "@utils/shortUrl";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FiCalendar, FiFileText, FiMousePointer } from "react-icons/fi";

interface ShortenedUrl {
  originalUrl: string;
  shortUrl: string;
  timestamp: number;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

export default function MyUrlsPage() {
  const { user, logout } = useUser();
  const router = useRouter();
  const { urls: localUrls = [], error, loading } = useUrls();
  const { deleteUrl, deleteLoading } = useDeleteUrl();
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    urlId: string | null;
  }>({
    isOpen: false,
    urlId: null
  });
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState<boolean>(false);
  const { deleteAccount } = useDeleteAccount();
  const [syncedUrls, setSyncedUrls] = useState<Url[]>([]);
  const [shouldUseLocal, setShouldUseLocal] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const decoded = tokenToUser(token);
      if (!decoded) {
        router.push("/login");
        return;
      }
    };

    checkAuth();
  }, [user, router]);

  useEffect(() => {
    const syncData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const storedUrls = JSON.parse(localStorage.getItem("urls") || "[]");
      const recentShortens = JSON.parse(localStorage.getItem("recent_shortens") || "[]");

      try {
        const data = await apiClient.getUrls(token);
        const serverUrls = data.urls;

        // MIGRATE IF RECENT SHORTENS ARE NOT IN THE SERVER
        if (recentShortens.length > 0) {
          const missing = recentShortens.filter(
            (r: ShortenedUrl) => !serverUrls.some((u: Url) => u.short_url === r.shortUrl)
          );
          if (missing.length > 0) {
            await apiClient.migrateShortens(missing, token);
            localStorage.removeItem("recent_shortens");
            // Odśwież dane po migracji
            const refreshedData = await apiClient.getUrls(token);
            localStorage.setItem("urls", JSON.stringify(refreshedData.urls));
            setSyncedUrls(refreshedData.urls);
            setShouldUseLocal(false);
            setNotification({
              message: "Migrated anonymous shortens to your account.",
              type: "success"
            });
            setIsInitialLoad(false);
            return;
          }
        }

        // Only update if there's a real difference in data
        const isDataMatching =
          storedUrls.length === serverUrls.length &&
          storedUrls.every((storedUrl: Url, index: number) => {
            const serverUrl = serverUrls[index];
            return (
              storedUrl.clicks === serverUrl.clicks &&
              storedUrl.original_url === serverUrl.original_url &&
              storedUrl.short_url === serverUrl.short_url
            );
          });

        if (!isDataMatching) {
          localStorage.setItem("urls", JSON.stringify(serverUrls));
          setSyncedUrls(serverUrls);
          setShouldUseLocal(false);
        }
      } catch (err) {
        console.error("Error syncing URLs:", err);
        setNotification({ message: "Failed to fetch URLs", type: "error" });
      } finally {
        setIsInitialLoad(false);
      }
    };

    syncData();
  }, []);

  const handleCopyOriginalUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setNotification({ message: "Original URL copied to clipboard!", type: "success" });
  };

  const handleCopyShortUrl = (slug: string) => {
    navigator.clipboard.writeText(formatShortUrl(slug));
    setNotification({ message: "URL copied to clipboard!", type: "success" });
  };

  const handleDeleteClick = (urlId: string) => {
    setDeleteConfirmation({ isOpen: true, urlId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.urlId) return;

    try {
      await deleteUrl(deleteConfirmation.urlId);
      setSyncedUrls((urls) => urls.filter((url) => url.id !== deleteConfirmation.urlId));
      setNotification({ message: "URL deleted successfully", type: "success" });
    } catch (err) {
      setNotification({
        message: err instanceof Error ? err.message : "Failed to delete URL",
        type: "error"
      });
    } finally {
      setDeleteConfirmation({ isOpen: false, urlId: null });
    }
  };

  const handleDeleteAccountClick = () => {
    setDeleteAccountConfirmation(true);
  };

  const handleDeleteAccountConfirm = async () => {
    try {
      await deleteAccount();
      setNotification({ message: "Account deleted successfully", type: "success" });
    } catch (err) {
      console.error("Error deleting account:", err);
      setNotification({
        message: err instanceof Error ? err.message : "Failed to delete account",
        type: "error"
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) return null;

  // Use local URLs by default, only switch to server data if they don't match
  const displayUrls = shouldUseLocal ? localUrls : syncedUrls;
  const totalClicks = displayUrls.reduce((sum, url) => sum + url.clicks, 0);
  const mostRecentUrl = displayUrls[0];
  const topUrls = displayUrls.slice(0, 4);

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-28 pt-12 sm:px-6 lg:px-16">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <ConfirmationOverlay
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, urlId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete URL"
        message="Are you sure you want to delete this URL? This action cannot be undone."
        confirmText="Delete"
      />
      <ConfirmationOverlay
        isOpen={deleteAccountConfirmation}
        onClose={() => setDeleteAccountConfirmation(false)}
        onConfirm={handleDeleteAccountConfirm}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete"
      />
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-2">Welcome back, {user.username || user.email}</p>
          <h1 className="hero-title">Dashboard Overview</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-[#252a30] px-4 py-2">
            <span className="text-cyan-300">
              <FiCalendar size={20} aria-hidden="true" />
            </span>
            <span className="mono-label">Last 30 Days</span>
          </div>
          <button onClick={handleLogout} className="secondary-button py-2">
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="metric-card group">
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-cyan-300/10 p-3">
              <span className="material-symbols-outlined text-[32px] text-cyan-200">link</span>
            </div>
            <span className="mono-label text-cyan-200">Active</span>
          </div>
          <div className="mt-8">
            <p className="mono-label mb-1">Total Links</p>
            <p className="text-5xl font-bold text-slate-100 transition group-hover:text-cyan-200">
              {displayUrls.length}
            </p>
          </div>
        </div>
        <div className="metric-card group">
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-cyan-300/10 p-3">
              <span className="text-cyan-300">
                <FiMousePointer size={32} aria-hidden="true" />
              </span>
            </div>
            <span className="mono-label text-cyan-200">Tracked</span>
          </div>
          <div className="mt-8">
            <p className="mono-label mb-1">Total Clicks</p>
            <p className="text-5xl font-bold text-slate-100 transition group-hover:text-cyan-200">
              {totalClicks}
            </p>
          </div>
        </div>
        <div className="metric-card group bg-gradient-to-br from-cyan-300/10 to-transparent">
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-white/10 p-3">
              <span className="material-symbols-outlined text-[32px] text-[#bac9cc]">query_stats</span>
            </div>
            <span className="mono-label">Latest</span>
          </div>
          <div className="mt-8">
            <p className="mono-label mb-1">Recent Link</p>
            <p className="truncate text-lg font-bold text-slate-100">
              {mostRecentUrl ? mostRecentUrl.short_url : "No links yet"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between px-2">
            <h2 className="section-title">Recent Activity</h2>
            <button
              onClick={() => router.push("/")}
              className="hidden items-center gap-2 text-sm font-medium text-[#bac9cc] transition hover:text-cyan-200 md:flex"
            >
              Shorten new link
              <FaArrowLeftLong />
            </button>
          </div>

          <div className="space-y-4">
            {isInitialLoad || loading ? (
              <div className="surface flex justify-center rounded-xl py-10">
                <Spinner />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-rose-300/20 bg-rose-500/10 px-4 py-4 text-center text-rose-200">
                {error}
              </div>
            ) : displayUrls.length === 0 ? (
              <div className="surface rounded-xl px-4 py-10 text-center text-[#bac9cc]">
                No URLs found. Start by creating your first short URL.
              </div>
            ) : (
              topUrls.map((url) => (
                <article
                  key={url.id}
                  className="surface rounded-xl p-6 transition duration-300 hover:border-cyan-300/30"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="icon-box">
                        <span className="transition group-hover:text-cyan-300">
                          <FiFileText size={22} aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-100">{url.original_url}</h3>
                        <p className="truncate font-mono text-sm text-[#bac9cc]">{url.short_url}</p>
                      </div>
                    </div>

                    <div className="flex w-full flex-wrap items-center justify-end gap-3 md:w-auto">
                      <div className="mr-1 hidden flex-col items-end md:flex">
                        <span className="mono-label text-slate-100">{url.clicks} clicks</span>
                        <span className="mono-label">{dateFormatter.format(new Date(url.created_at))}</span>
                      </div>
                      <button
                        onClick={() => handleCopyOriginalUrl(url.original_url)}
                        className="subtle-button"
                        aria-label="Copy original URL"
                      >
                        <span className="material-symbols-outlined text-[20px]">content_copy</span>
                        <span className="sr-only">Copy original</span>
                      </button>
                      <button
                        onClick={() => handleCopyShortUrl(url.short_url)}
                        className="subtle-button"
                        aria-label="Copy short URL"
                      >
                        <span className="material-symbols-outlined text-[20px]">link</span>
                        <span className="sr-only">Copy short</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(url.id)}
                        disabled={deleteLoading === url.id}
                        className="rounded-lg border border-rose-300/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/15 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deleteLoading === url.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl bg-cyan-300 p-6 text-cyan-950 shadow-xl shadow-cyan-300/10">
            <h3 className="text-2xl font-bold">Quick Shorten</h3>
            <p className="mt-2 text-sm font-medium text-cyan-950/70">
              Create another clean link from the home shortener.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-950 px-4 py-3 font-bold text-cyan-200 transition hover:opacity-90"
            >
              <span className="material-symbols-outlined">bolt</span>
              Shorten Now
            </button>
          </div>

          <div className="surface-strong rounded-xl p-6">
            <p className="eyebrow">Account</p>
            <div className="mt-4 flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-300/30 bg-cyan-300/10 text-xl font-bold text-cyan-100">
                {(user.username || user.email || "U").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-slate-100">
                  {user.username || "Signed in user"}
                </p>
                <p className="truncate text-sm leading-6 text-[#bac9cc]">{user.email}</p>
                <p className="mt-3 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-200">
                  Account active
                </p>
              </div>
            </div>
          </div>

          <div className="surface rounded-xl p-6">
            <p className="eyebrow">Active Tags</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Personal", "Campaigns", "Reference", "Shared"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#30353b] px-3 py-1 text-xs font-medium text-[#bac9cc] transition hover:bg-cyan-300/15 hover:text-cyan-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="surface rounded-xl p-6">
            <p className="eyebrow">Activity summary</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-[#171c21] px-4 py-3">
                <span className="text-sm text-[#bac9cc]">Most recent update</span>
                <span className="text-sm font-medium text-slate-100">
                  {mostRecentUrl ? dateFormatter.format(new Date(mostRecentUrl.created_at)) : "None"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-[#171c21] px-4 py-3">
                <span className="text-sm text-[#bac9cc]">Latest created</span>
                <span className="text-sm font-medium text-slate-100">
                  {mostRecentUrl
                    ? dateTimeFormatter.format(new Date(mostRecentUrl.created_at))
                    : "None"}
                </span>
              </div>
            </div>
          </div>

          <section className="rounded-xl border border-rose-300/10 bg-gradient-to-b from-transparent to-rose-500/5 p-6">
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-rose-200">
                  <span className="material-symbols-outlined">warning</span>
                  Danger Zone
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#bac9cc]">
                  Deleting your account will permanently remove your shortened links and account
                  data.
                </p>
              </div>
              <button
                onClick={handleDeleteAccountClick}
                className="rounded-lg border border-rose-300/40 px-5 py-3 text-sm font-bold text-rose-200 transition hover:bg-rose-500/10"
              >
                Delete Account
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
