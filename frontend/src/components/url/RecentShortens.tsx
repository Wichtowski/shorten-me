import React from 'react';
import { useRecentShortens } from '@/hooks/useRecentShortens';

const RecentShortens = () => {
  const { recentShortens, clearRecentShortens } = useRecentShortens();

  if (recentShortens.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-primary-dark/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-primary-light/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-primary-lightest">Recent Shortenings</h3>
        <button
          onClick={clearRecentShortens}
          className="text-primary-light hover:text-primary-lightest text-sm"
        >
          Clear History
        </button>
      </div>
      <div className="space-y-4">
        {recentShortens.map((shorten, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-primary-darkest/50 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <p className="text-primary-lightest truncate">{shorten.originalUrl}</p>
              <a
                href={`/r/${shorten.shortUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-light hover:text-primary-lightest text-sm truncate block"
              >
                {shorten.shortUrl}
              </a>
            </div>
            <span className="text-primary-light/60 text-sm whitespace-nowrap">
              {new Date(shorten.timestamp).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentShortens; 