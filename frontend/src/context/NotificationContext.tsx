import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/common/Notification';

interface NotificationContextType {
    showNotification: (message: string, type?: 'error' | 'success' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notification, setNotification] = useState<{
        message: string;
        type: 'error' | 'success' | 'info';
    } | null>(null);

    const showNotification = useCallback((message: string, type: 'error' | 'success' | 'info' = 'info') => {
        setNotification({ message, type });
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(null);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={hideNotification}
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}; 