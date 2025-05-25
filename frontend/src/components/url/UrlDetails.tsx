import React from 'react';
import { useNotification } from '@/components/context/NotificationContext';

interface UrlDetailsProps {
    shortUrl: string;
    originalUrl: string;
}

const UrlDetails = ({ shortUrl, originalUrl }: UrlDetailsProps) => {
    const { showNotification } = useNotification();

    const copyUrl = () => {
        navigator.clipboard.writeText(shortUrl);
        showNotification('URL copied to clipboard!', 'success');
    };

    return (
        <div className="mt-8 p-6 bg-primary-darkest/30 rounded-lg border border-primary-light/20">
            <div className="space-y-4">
                <div>
                    <h3 className="text-primary-lightest text-lg mb-2">URL Details</h3>
                    <div className="space-y-2">
                        <p className="text-primary-light">
                            <span className="text-primary-lightest">Original URL:</span> {originalUrl}
                        </p>
                        <p className="text-primary-light">
                            <span className="text-primary-lightest">Short URL:</span> {shortUrl}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={shortUrl}
                        readOnly
                        className="flex-1 px-3 py-2 rounded-lg bg-primary-darkest/50 border border-primary-light/30 text-white"
                    />
                    <button
                        onClick={copyUrl}
                        className="bg-primary-light hover:bg-primary-lightest text-white px-4 py-2 rounded-lg transition-all duration-200"
                    >
                        Copy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UrlDetails; 