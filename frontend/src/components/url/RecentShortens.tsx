import React, { useState } from 'react';
import { useRecentShortens } from '@/hooks/useRecentShortens';

const RecentShortens = () => {
  const { recentShortens, clearRecentShortens, updateShorten } = useRecentShortens();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

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
    setEditValue('');
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditValue('');
  };

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
              {editIndex === index ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="px-2 py-1 rounded bg-primary-darkest border border-primary-light/30 text-white flex-1"
                  />
                  <button
                    onClick={() => handleSave(index)}
                    className="text-primary-lightest bg-primary-light px-2 py-1 rounded hover:bg-primary-lightest hover:text-primary-darkest"
                  >
                    Zapisz
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-primary-light px-2 py-1 rounded hover:text-primary-lightest"
                  >
                    Anuluj
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-primary-lightest truncate">{shorten.originalUrl}</p>
                  <button
                    onClick={() => handleEdit(index, shorten.originalUrl)}
                    className="text-primary-light hover:text-primary-lightest text-xs border border-primary-light px-2 py-1 rounded"
                  >
                    Edytuj
                  </button>
                </div>
              )}
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
