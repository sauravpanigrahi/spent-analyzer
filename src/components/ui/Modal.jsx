import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  className = "",
  blurBackdrop = true,
}) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        ref={overlayRef}
        className={`fixed inset-0 z-0 bg-black/50 ${blurBackdrop ? "backdrop-blur-sm" : ""} animate-in`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex min-h-full items-center justify-center p-4 pointer-events-none">
        <div
          ref={contentRef}
          className={`w-full ${sizes[size]} pointer-events-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 animate-in ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          aria-describedby={description ? "modal-description" : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || description) && (
            <div className="flex items-start justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                {title && (
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="modal-description"
                    className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
                  >
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  loading = false,
  blurBackdrop = true,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      blurBackdrop={blurBackdrop}
    >
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="btn btn-secondary btn-sm"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`btn btn-sm ${variant === "destructive" ? "btn-destructive" : variant === "primary" ? "btn-primary" : "btn-success"}`}
        >
          {loading ? "Processing..." : confirmText}
        </button>
      </div>
    </Modal>
  );
};
