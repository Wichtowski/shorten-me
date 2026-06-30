import { Url } from "@shared/url";

interface UrlTableProps {
  urls: Url[];
  onCopyOriginalUrl: (url: string) => void;
  onCopyShortUrl: (slug: string) => void;
  onDeleteUrl: (urlId: string) => void;
  deleteLoading?: boolean;
}

export function UrlTable({
  urls = [],
  onCopyOriginalUrl,
  onCopyShortUrl,
  onDeleteUrl,
  deleteLoading
}: UrlTableProps) {
  return (
    <>
      {urls.map((url) => (
        <tr key={url.id} className="border-b border-white/10 transition hover:bg-white/[0.03] last:border-0">
          <td className="px-6 py-4 text-slate-100">
            <div className="flex items-center gap-3">
              <span className="truncate max-w-[300px]">{url.original_url}</span>
              <button
                onClick={() => onCopyOriginalUrl(url.original_url)}
                className="subtle-button px-2 py-1 text-xs"
              >
                Copy
              </button>
            </div>
          </td>
          <td className="px-6 py-4 text-slate-100">
            <div className="flex items-center gap-3">
              <span className="truncate max-w-[200px] font-medium text-cyan-200">{url.short_url}</span>
              <button
                onClick={() => onCopyShortUrl(url.short_url)}
                className="subtle-button px-2 py-1 text-xs"
              >
                Copy
              </button>
            </div>
          </td>
          <td className="px-6 py-4 text-slate-100">
            <span className="inline-flex min-w-12 justify-center rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm font-semibold text-emerald-100">
              {url.clicks}
            </span>
          </td>
          <td className="px-6 py-4 text-slate-300">
            {new Date(url.created_at).toLocaleDateString()}
          </td>
          <td className="px-6 py-4">
            <button
              onClick={() => onDeleteUrl(url.id)}
              disabled={deleteLoading}
              className="rounded-xl border border-rose-300/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/15 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
