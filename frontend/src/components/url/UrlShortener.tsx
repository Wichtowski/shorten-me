'use client';

import React, { useState } from 'react';
import { isMockMode, generateMockShortUrl, canShortenMore, incrementShortenCount } from '@/utils/urlUtils';
import { useNotification } from '@/components/context/NotificationContext';
import UrlDetails from './UrlDetails';
import UrlParameters from './UrlParameters';

const UrlShortener = () => {
    const [url, setUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { showNotification } = useNotification();
    const [mockShortUrl, setMockShortUrl] = useState('');

    // Mock isLoggedIn state - replace with actual auth logic
    const isLoggedIn = false;

    const validateUrl = async (urlString: string) => {
        try {
            const url = new URL(urlString);
            if (url.protocol !== 'https:') {
                throw new Error('Only HTTPS URLs are allowed');
            }
            return true;
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Invalid URL');
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!canShortenMore()) {
            showNotification('You have reached the maximum number of URL shortenings (3). Please sign up to continue.', 'info');
            setLoading(false);
            return;
        }

        if (!(await validateUrl(url))) {
            setLoading(false);
            return;
        }

        try {
            if (isMockMode()) {
                await new Promise(resolve => setTimeout(resolve, 500));
                // Only call generateMockShortUrl on the client
                if (typeof window !== 'undefined') {
                    const generated = generateMockShortUrl(url);
                    setShortUrl(generated);
                    setMockShortUrl(generated);
                }
                incrementShortenCount();
                showNotification('URL shortened successfully!', 'success');
            } else {
                const response = await fetch(`/api/shorten/me`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url }),
                });
                const data = await response.json();
                setShortUrl(data.shortUrl);
                incrementShortenCount();
                showNotification('URL shortened successfully!', 'success');
            }
        } catch (error) {
            setError('Failed to shorten URL');
            showNotification('Failed to shorten URL', 'error');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-primary-dark/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-primary-light/20">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="url" className="block text-primary-lightest mb-2 text-lg">
                            Enter your URL
                        </label>
                        <input
                            type="url"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-primary-darkest/50 border border-primary-light/30 text-white focus:outline-none focus:border-primary-lightest focus:ring-2 focus:ring-primary-lightest/20"
                            placeholder="https://example.com"
                            required
                        />
                        {error && (
                            <p className="mt-2 text-red-400 text-sm">{error}</p>
                        )}
                        <p className="mt-2 text-primary-light text-sm">
                            {isMockMode() && 'Mock mode is active'}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-light hover:bg-primary-lightest text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? 'Shortening...' : 'Shorten URL'}
                    </button>
                </form>

                {shortUrl && (
                    <>
                        <UrlDetails
                            shortUrl={shortUrl}
                            originalUrl={url}
                        />
                        {isLoggedIn && (
                            <UrlParameters shortUrl={shortUrl} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UrlShortener; 