import React from "react";
import { useNotification } from "@components/context/NotificationContext";
import { CopyButton } from "@components/common/CopyButton";
import { formatShortUrl } from "@utils/shortUrl";

interface UrlDetailsProps {
  shortUrl: string;
  originalUrl: string;
}

export const UrlDetails = ({ shortUrl, originalUrl }: UrlDetailsProps) => {
  const { showNotification } = useNotification();
  const fullShortUrl = formatShortUrl(shortUrl);

  return (
    <div className="surface rounded-xl p-6 sm:p-8">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Result</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-100">
              Your short link is ready
            </h3>
          </div>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
            Copiable
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-white/[0.05] bg-[#0a0f14] p-4">
            <p className="mono-label">
              Original URL
            </p>
            <p className="mt-2 break-all text-sm leading-6 text-slate-100">{originalUrl}</p>
          </div>

          <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
            <p className="mono-label text-cyan-200">
              Short URL
            </p>
            <p className="mt-2 break-all text-sm font-medium text-slate-50">{fullShortUrl}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input type="text" value={fullShortUrl} readOnly className="field flex-1" />
          <CopyButton
            value={fullShortUrl}
            onCopied={() => showNotification("URL copied to clipboard!", "success")}
            className="primary-button px-5 py-3"
          />
        </div>
      </div>
    </div>
  );
};
