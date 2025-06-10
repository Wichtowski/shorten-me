import { Url } from '@/types/url';

interface UrlTableProps {
  urls: Url[];
  onCopyUrl: (url: string) => void;
  onDeleteUrl: (urlId: string) => void;
  deleteLoading?: boolean;
}

export function UrlTable({ urls = [], onCopyUrl, onDeleteUrl, deleteLoading }: UrlTableProps) {
  return (
    <>
      {urls.map((url) => (
        <tr key={url.id} className="border-b border-primary-light/20 last:border-0">
          <td className="px-6 py-4 text-primary-lightest">
            <div className="flex items-center gap-2">
              <span className="truncate max-w-[300px]">{url.original_url}</span>
              <button
                onClick={() => onCopyUrl(url.original_url)}
                className="text-primary-light hover:text-primary-lightest transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
          </td>
          <td className="px-6 py-4 text-primary-lightest">
            <div className="flex items-center gap-2">
              <span className="truncate max-w-[200px]">{url.short_url}</span>
              <button
                onClick={() => onCopyUrl(url.short_url)}
                className="text-primary-light hover:text-primary-lightest transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
          </td>
          <td className="px-6 py-4 text-primary-lightest">{url.clicks}</td>
          <td className="px-6 py-4 text-primary-lightest">
            {new Date(url.created_at).toLocaleDateString()}
          </td>
          <td className="px-6 py-4">
            <button
              onClick={() => onDeleteUrl(url.id)}
              disabled={deleteLoading}
              className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
