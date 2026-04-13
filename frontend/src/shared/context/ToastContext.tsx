import { createContext } from "react";

export type ToastType = "success" | "warning" | "error";

type ToastContextType = {
  showToast: (type: ToastType, title: string, message?: string) => void;
};

export const ToastContext = createContext<ToastContextType | null>(null);
