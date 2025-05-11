import React, { useEffect } from 'react';

interface NotificationProps {
    message: string;
    type?: 'error' | 'success' | 'info';
    onClose: () => void;
    duration?: number;
}

const Notification = ({ message, type = 'info', onClose, duration = 3000 }: NotificationProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = {
        error: 'bg-red-500',
        success: 'bg-green-500',
        info: 'bg-primary-light'
    }[type];

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className={`${bgColor} text-white px-8 py-4 rounded-lg shadow-lg flex items-center space-x-3 relative z-10 animate-fade-in`}>
                <span className="text-lg">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-2 hover:text-white/80 transition-colors text-xl"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Notification; 