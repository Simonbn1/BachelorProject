import { useContext } from "react";
import { ToastContext } from "../context/ToastContext.tsx";

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToasts must be used within a ToastProvider");
  return ctx;
}
