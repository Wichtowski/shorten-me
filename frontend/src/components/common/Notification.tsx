'use client';
import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
  duration?: number;
}

const ANIMATION_DURATION = 400;
const NOTIFICATION_HEIGHT = 64; // px

const Notification = ({ message, type = 'info', onClose, duration = 3000 }: NotificationProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (!visible) {
      const timeout = setTimeout(() => {
        onClose();
      }, ANIMATION_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [visible, onClose]);

  const bgColor = {
    error: 'bg-red-500',
    success: 'bg-green-500',
    info: 'bg-primary-light',
  }[type];

  return (
    <div
      className="fixed left-0 right-0 z-40 flex justify-center pointer-events-none"
      style={{ top: 64, height: NOTIFICATION_HEIGHT }}
    >
      <div
        className={
          ` ${bgColor} text-white px-8 py-4 rounded-b-lg shadow-lg flex items-center space-x-3 relative pointer-events-auto transition-all duration-400 ease-in-out ` +
          (visible ? 'notification-in' : 'notification-out')
        }
        style={{
          minWidth: 320,
          maxWidth: 480,
          height: NOTIFICATION_HEIGHT,
          opacity: visible ? 1 : 0,
        }}
      >
        <span className="text-lg flex-1">{message}</span>
        <button
          onClick={() => setVisible(false)}
          className="ml-2 hover:text-white/80 transition-colors text-xl"
        >
          ×
        </button>
      </div>
      <style>{`
                .notification-in {
                    transform: translateY(-32px);
                    opacity: 0;
                    animation: slide-down-in 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
                }
                .notification-out {
                    transform: translateY(0);
                    opacity: 1;
                    animation: slide-up-out 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
                }
                @keyframes slide-down-in {
                    0% { transform: translateY(-32px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes slide-up-out {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(-32px); opacity: 0; }
                }
            `}</style>
    </div>
  );
};

export default Notification;
