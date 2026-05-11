import { type ReactNode, useCallback, useState } from "react";
import Toast from "./Toast.tsx";
import { ToastContext, type ToastType } from "../context/ToastContext.tsx";

type ToastData = {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  persistent?: boolean;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, persistent = false) => {
      const id = Date.now() + Math.random();

      setToasts((prev) => [
        ...prev,
        {
          id,
          type,
          title,
          message,
          persistent,
        },
      ]);

      if (!persistent) {
        window.setTimeout(() => {
          removeToast(id);
        }, 7000);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
