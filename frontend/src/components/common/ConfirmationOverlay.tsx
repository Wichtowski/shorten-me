interface ConfirmationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmationOverlay({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel"
}: ConfirmationOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md">
      <div className="surface-strong w-full max-w-md rounded-[1.75rem] p-6">
        <h3 className="text-xl font-semibold text-slate-50">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="subtle-button"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
