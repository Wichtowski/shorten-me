import React, { useState } from "react";
import { useRecentShortens } from "@hooks/useRecentShortens";

export const RecentShortens = () => {
  const { recentShortens, clearRecentShortens, updateShorten } = useRecentShortens();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  if (recentShortens.length === 0) {
    return null;
  }

  const handleEdit = (index: number, currentValue: string) => {
    setEditIndex(index);
    setEditValue(currentValue);
  };

  const handleSave = (index: number) => {
    updateShorten(index, { originalUrl: editValue });
    setEditIndex(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditValue("");
  };

  return (
    <div className="surface rounded-xl p-6 sm:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Recent activity</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-100">Recent shortenings</h3>
        </div>
        <button
          onClick={clearRecentShortens}
          className="subtle-button"
        >
          Clear History
        </button>
      </div>
      <div className="space-y-3">
        {recentShortens.map((shorten, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-lg border border-white/[0.05] bg-[#171c21] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              {editIndex === index ? (
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="field flex-1 px-3 py-2"
                  />
                  <button
                    onClick={() => handleSave(index)}
                    className="primary-button px-3 py-2 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="subtle-button px-3 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-slate-100">{shorten.originalUrl}</p>
                  <button
                    onClick={() => handleEdit(index, shorten.originalUrl)}
                    className="subtle-button px-2 py-1 text-xs"
                  >
                    Edit
                  </button>
                </div>
              )}
              <a
                href={`/r/${shorten.shortUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block truncate text-sm text-cyan-300 transition hover:text-cyan-100"
              >
                {shorten.shortUrl}
              </a>
            </div>
            <span className="whitespace-nowrap text-sm text-[#bac9cc]">
              {new Date(shorten.timestamp).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
