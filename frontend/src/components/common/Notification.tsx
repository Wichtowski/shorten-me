"use client";
import React, { useEffect, useState } from "react";

interface NotificationProps {
  message: string;
  type?: "error" | "success" | "info";
  onClose: () => void;
  duration?: number;
}

const ANIMATION_DURATION = 400;
const NOTIFICATION_HEIGHT = 64; // px

export const Notification = ({
  message,
  type = "info",
  onClose,
  duration = 3000
}: NotificationProps) => {
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

  const styles = {
    error: "border-rose-300/20 bg-rose-500/90 text-white shadow-[0_20px_50px_-24px_rgba(244,63,94,0.65)]",
    success:
      "border-emerald-300/20 bg-emerald-500/90 text-white shadow-[0_20px_50px_-24px_rgba(16,185,129,0.65)]",
    info:
      "border-cyan-300/20 bg-slate-950/90 text-slate-50 shadow-[0_20px_50px_-24px_rgba(14,165,233,0.55)]"
  }[type];

  return (
    <div className="fixed left-0 right-0 top-24 z-40 flex justify-center pointer-events-none">
      <div
        className={
          `surface pointer-events-auto flex items-center gap-3 rounded-2xl px-5 py-4 transition-all duration-300 ease-in-out ` +
          styles +
          (visible ? "notification-in" : "notification-out")
        }
        style={{
          minWidth: 320,
          maxWidth: 560,
          minHeight: NOTIFICATION_HEIGHT,
          opacity: visible ? 1 : 0
        }}
      >
        <span className="flex-1 text-sm font-medium leading-6">{message}</span>
        <button
          onClick={() => setVisible(false)}
          className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-lg leading-none text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          x
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
